const express = require("express");
const router = express.Router();
const { allQuery, getQuery, runQuery, db } = require("../database");

// --- CARD ROUTES ---

// Get all available domains
router.get("/domains", async (req, res) => {
  try {
    const rows = await allQuery("SELECT name FROM domains ORDER BY name ASC");
    const names = rows.map((r) => r.name.trim());
    res.json(names);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy path for compatibility
router.get("/cards/domains", async (req, res) => {
  try {
    const rows = await allQuery("SELECT name FROM domains ORDER BY name ASC");
    res.json(rows.map((r) => r.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Card browse and search
router.get("/cards", async (req, res) => {
  const {
    q,
    domains,
    type,
    rarity,
    sort,
    order,
    energy_min,
    energy_max,
    power_min,
    power_max,
    might_min,
    might_max,
    page = 1,
    limit = 20,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  let baseSql = "FROM cards WHERE 1=1 AND supertype != 'Token'";
  const params = [];

  if (q) {
    baseSql += " AND (name LIKE ? OR plain_text LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }

  if (domains) {
    const domainList = domains.split(",");
    const domainClauses = domainList.map(() => "domain LIKE ?").join(" OR ");
    baseSql += ` AND (${domainClauses})`;
    domainList.forEach((d) => params.push(`%${d.trim()}%`));
  }

  if (type) {
    const typeList = type.split(",");
    const legendTags = req.query.legendTags
      ? req.query.legendTags.split(",")
      : [];

    const typeClauses = typeList
      .map((t) => {
        const trimmed = t.trim();
        if (trimmed === "Champion") {
          return "((type LIKE ? OR supertype LIKE ?) AND type NOT LIKE '%Legend%' AND supertype NOT LIKE '%Legend%')";
        }
        if (trimmed === "Unit") {
          return "(type LIKE ? AND type NOT LIKE '%Champion%' AND supertype NOT LIKE '%Champion%' AND type NOT LIKE '%Legend%' AND supertype NOT LIKE '%Legend%')";
        }
        if (trimmed === "Spell") {
          // Si es un Spell y tiene supertype Signature, filtrar por tags de la leyenda
          if (legendTags.length > 0) {
            const tagClauses = legendTags.map(() => "tags LIKE ?").join(" OR ");
            return `(type LIKE ? AND (supertype NOT LIKE '%Signature%' OR (${tagClauses})) AND type NOT LIKE '%Legend%' AND supertype NOT LIKE '%Legend%')`;
          }
          return "(type LIKE ? AND supertype NOT LIKE '%Signature%' AND type NOT LIKE '%Legend%' AND supertype NOT LIKE '%Legend%')";
        }
        if (trimmed !== "Legend") {
          return "(type LIKE ? AND type NOT LIKE '%Legend%' AND supertype NOT LIKE '%Legend%')";
        }
        return "type LIKE ?";
      })
      .join(" OR ");
    baseSql += ` AND (${typeClauses})`;

    typeList.forEach((t) => {
      const trimmed = t.trim();
      if (trimmed === "Champion") {
        params.push(`%${trimmed}%`, `%${trimmed}%`);
      } else if (trimmed === "Spell" && legendTags.length > 0) {
        params.push(`%${trimmed}%`);
        legendTags.forEach((tag) => params.push(`%${tag.trim()}%`));
      } else {
        params.push(`%${trimmed}%`);
      }
    });
  }

  // Stat Range Filters
  const stats = {
    energy: [energy_min, energy_max],
    power: [power_min, power_max],
    might: [might_min, might_max],
  };
  for (const [key, [min, max]] of Object.entries(stats)) {
    if (min !== undefined && min !== "") {
      baseSql += ` AND ${key} >= ?`;
      params.push(min);
    }
    if (max !== undefined && max !== "") {
      baseSql += ` AND ${key} <= ?`;
      params.push(max);
    }
  }

  if (rarity) {
    const rarityList = rarity.split(",");
    const rarityClauses = rarityList.map(() => "rarity = ?").join(" OR ");
    baseSql += ` AND (${rarityClauses})`;
    rarityList.forEach((r) => params.push(r.trim()));
  }

  try {
    const countRow = await getQuery(
      `SELECT COUNT(*) as count ${baseSql}`,
      params,
    );
    const total = countRow.count;

    let dataSql = `SELECT * ${baseSql}`;
    const validSorts = ["name", "energy", "power", "might"];
    const sortCol = validSorts.includes(sort) ? sort : "name";
    const sortOrder = order?.toUpperCase() === "DESC" ? "DESC" : "ASC";
    dataSql += ` ORDER BY ${sortCol} ${sortOrder} LIMIT ? OFFSET ?`;

    const rows = await allQuery(dataSql, [...params, limitNum, offset]);
    res.json({
      data: rows,
      pagination: {
        current: pageNum,
        limit: limitNum,
        total: total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DECK ROUTES ---

// Get random cards for Hero background
router.get("/cards/random", (req, res) => {
  const count = parseInt(req.query.count) || 4;
  // Solo cartas que tengan imagen y que sean de tipos interesantes (Unit, Champion, Legend)
  const sql = `
    SELECT image_url 
    FROM cards 
    WHERE image_url IS NOT NULL AND image_url != ''
    ORDER BY RANDOM() 
    LIMIT ?
  `;

  db.all(sql, [count], (err, rows) => {
    if (err) {
      console.error("Error fetching random cards:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map((row) => row.image_url));
  });
});

// Get all decks
router.get("/decks", async (req, res) => {
  try {
    const rows = await allQuery("SELECT * FROM decks");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new deck
router.post("/decks", async (req, res) => {
  try {
    const result = await runQuery("INSERT INTO decks (name) VALUES (?)", [
      req.body.name,
    ]);
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific deck with cards
router.get("/decks/:deckId", async (req, res) => {
  try {
    const deck = await getQuery("SELECT * FROM decks WHERE id = ?", [
      req.params.deckId,
    ]);
    if (!deck) return res.status(404).json({ error: "Deck not found" });

    const cardsSql = `SELECT c.*, dc.is_sideboard FROM cards c
                     JOIN deck_cards dc ON c.id = dc.card_id
                     WHERE dc.deck_id = ?`;
    const cards = await allQuery(cardsSql, [req.params.deckId]);
    res.json({ ...deck, cards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update deck
router.patch("/decks/:deckId", async (req, res) => {
  const { name, description, mainChampionId } = req.body;
  try {
    if (mainChampionId !== undefined) {
      await runQuery("UPDATE decks SET main_champion_id = ? WHERE id = ?", [
        mainChampionId,
        req.params.deckId,
      ]);
    } else {
      await runQuery(
        "UPDATE decks SET name = ?, description = ? WHERE id = ?",
        [name, description, req.params.deckId],
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add card to deck
router.post("/decks/:deckId/cards", async (req, res) => {
  const { cardId, isSideboard } = req.body;
  try {
    await runQuery(
      "INSERT INTO deck_cards (deck_id, card_id, is_sideboard) VALUES (?, ?, ?)",
      [req.params.deckId, cardId, isSideboard ? 1 : 0],
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove card from deck
router.delete("/decks/:deckId/cards/:cardId", async (req, res) => {
  const { isSideboard } = req.query;
  const sql = `DELETE FROM deck_cards WHERE id = (SELECT id FROM deck_cards WHERE deck_id = ? AND card_id = ? AND is_sideboard = ? LIMIT 1)`;
  try {
    const result = await runQuery(sql, [
      req.params.deckId,
      req.params.cardId,
      isSideboard === "true" ? 1 : 0,
    ]);
    res.json({ success: true, removedCount: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete deck
router.delete("/decks/:deckId", async (req, res) => {
  try {
    await runQuery("DELETE FROM deck_cards WHERE deck_id = ?", [
      req.params.deckId,
    ]);
    const result = await runQuery("DELETE FROM decks WHERE id = ?", [
      req.params.deckId,
    ]);
    res.json({ success: true, deletedCount: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
