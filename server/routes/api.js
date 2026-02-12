const express = require("express");
const router = express.Router();
const { allQuery, getQuery, runQuery, db } = require("../database");
const bcrypt = require("bcryptjs");

// --- AUTH ROUTES ---

// Register user
router.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await runQuery(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
    );
    res.json({ id: result.lastID, username });
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(400).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login user
router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await getQuery("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    res.json({ id: user.id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
      ? req.query.legendTags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== "")
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
      } else {
        params.push(`%${trimmed}%`);
      }
    });

    // RESTRICCIÓN GLOBAL DE SIGNATURE:
    // Si una carta es Signature, sus tags DEBEN coincidir con los de la leyenda.
    if (legendTags.length > 0) {
      const tagClauses = legendTags.map(() => "tags LIKE ?").join(" OR ");
      baseSql += ` AND (supertype NOT LIKE '%Signature%' OR ${tagClauses})`;
      legendTags.forEach((tag) => params.push(`%${tag}%`));
    } else {
      // Si no hay leyenda seleccionada, no mostramos ninguna Signature
      baseSql += " AND supertype NOT LIKE '%Signature%'";
    }
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
  const userId = req.query.userId ? parseInt(req.query.userId) : null;
  try {
    let sql = `
      SELECT d.*, 
        (SELECT c.image_url 
         FROM cards c 
         JOIN deck_cards dc ON c.id = dc.card_id 
         WHERE dc.deck_id = d.id AND c.type = 'Legend' 
         LIMIT 1) as legend_image
      FROM decks d
    `;
    const params = [];
    if (userId) {
      sql += " WHERE d.user_id = ?";
      params.push(userId);
    } else {
      // Si no hay userId, solo devolver públicos
      sql +=
        " WHERE (d.visibility = 'public' OR d.visibility IS NULL OR d.visibility = '')";
    }
    const rows = await allQuery(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get latest decks
router.get("/latest-decks", async (req, res) => {
  try {
    const sql = `
      SELECT d.*, u.username,
        (SELECT c.image_url 
         FROM cards c 
         JOIN deck_cards dc ON c.id = dc.card_id 
         WHERE dc.deck_id = d.id AND c.type = 'Legend' 
         LIMIT 1) as legend_image
      FROM decks d
      LEFT JOIN users u ON d.user_id = u.id
      WHERE (d.visibility = 'public' OR d.visibility IS NULL OR d.visibility = '')
      ORDER BY d.id DESC 
      LIMIT 10
    `;
    const decks = await allQuery(sql);
    res.json(decks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new deck
router.post("/decks", async (req, res) => {
  const { name, userId, visibility } = req.body;
  try {
    const result = await runQuery(
      "INSERT INTO decks (name, user_id, visibility) VALUES (?, ?, ?)",
      [name, userId || null, visibility || "public"],
    );
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific deck with cards
router.get("/decks/:deckId", async (req, res) => {
  const userId = req.query.userId ? parseInt(req.query.userId) : null;
  try {
    const deckSql = `
      SELECT d.*, 
        (SELECT c.image_url 
         FROM cards c 
         JOIN deck_cards dc ON c.id = dc.card_id 
         WHERE dc.deck_id = d.id AND c.type = 'Legend' 
         LIMIT 1) as legend_image
      FROM decks d 
      WHERE d.id = ?
    `;
    const deck = await getQuery(deckSql, [req.params.deckId]);
    if (!deck) return res.status(404).json({ error: "Deck not found" });

    // -- Control de Acceso --
    // Si el mazo es privado, solo el dueño puede verlo
    if (deck.visibility === "private" && deck.user_id !== userId) {
      return res.status(403).json({ error: "This deck is private." });
    }

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
  const { name, description, mainChampionId, visibility } = req.body;
  try {
    if (mainChampionId !== undefined) {
      await runQuery("UPDATE decks SET main_champion_id = ? WHERE id = ?", [
        mainChampionId,
        req.params.deckId,
      ]);
    } else {
      const updates = [];
      const params = [];
      if (name !== undefined) {
        updates.push("name = ?");
        params.push(name);
      }
      if (description !== undefined) {
        updates.push("description = ?");
        params.push(description);
      }
      if (visibility !== undefined) {
        updates.push("visibility = ?");
        params.push(visibility);
      }

      if (updates.length > 0) {
        params.push(req.params.deckId);
        await runQuery(
          `UPDATE decks SET ${updates.join(", ")} WHERE id = ?`,
          params,
        );
      }
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
