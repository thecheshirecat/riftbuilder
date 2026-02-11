const express = require("express");
const router = express.Router();
const { db } = require("../database");

// Get all available domains
router.get("/domains", (req, res) => {
  const sql = "SELECT name FROM domains ORDER BY name ASC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const domains = rows.map((r) => r.name);
    res.json(domains);
  });
});

// Card browse and search
router.get("/", (req, res) => {
  const {
    q,
    domains,
    type,
    energy_min,
    energy_max,
    power_min,
    power_max,
    might_min,
    might_max,
    rarity,
    sort,
    order,
    page = 1,
    limit = 20,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // Global exclusion: Token supertype is not collectible/browseable
  let baseSql = "FROM cards WHERE 1=1 AND supertype != 'Token'";
  const params = [];

  // Text Search
  if (q) {
    baseSql += " AND (name LIKE ? OR plain_text LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }

  // Domain Filter
  if (domains) {
    const domainList = domains.split(",");
    const domainClauses = domainList.map(() => "domain LIKE ?").join(" OR ");
    baseSql += ` AND (${domainClauses})`;
    domainList.forEach((d) => params.push(`%${d.trim()}%`));
  }

  // Type Filter
  if (type) {
    const typeList = type.split(",");
    const typeClauses = typeList.map(() => "type = ?").join(" OR ");
    baseSql += ` AND (${typeClauses})`;
    typeList.forEach((t) => params.push(t.trim()));
  }

  // Stat Range Filters (Explicit check for 0)
  if (energy_min !== undefined && energy_min !== "") {
    baseSql += " AND energy >= ?";
    params.push(energy_min);
  }
  if (energy_max !== undefined && energy_max !== "") {
    baseSql += " AND energy <= ?";
    params.push(energy_max);
  }
  if (power_min !== undefined && power_min !== "") {
    baseSql += " AND power >= ?";
    params.push(power_min);
  }
  if (power_max !== undefined && power_max !== "") {
    baseSql += " AND power <= ?";
    params.push(power_max);
  }
  if (might_min !== undefined && might_min !== "") {
    baseSql += " AND might >= ?";
    params.push(might_min);
  }
  if (might_max !== undefined && might_max !== "") {
    baseSql += " AND might <= ?";
    params.push(might_max);
  }

  // Rarity Filter
  if (rarity) {
    const rarityList = rarity.split(",");
    const rarityClauses = rarityList.map(() => "rarity = ?").join(" OR ");
    baseSql += ` AND (${rarityClauses})`;
    rarityList.forEach((r) => params.push(r.trim()));
  }

  // Step 1: Count total matching records for pagination
  const countSql = `SELECT COUNT(*) as count ${baseSql}`;

  db.get(countSql, params, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = row.count;

    // Step 2: Query actual data
    let dataSql = `SELECT * ${baseSql}`;

    // Sorting
    if (sort) {
      const validSorts = ["name", "energy", "power", "might"];
      const sortCol = validSorts.includes(sort) ? sort : "name";
      const sortOrder =
        order && order.toUpperCase() === "DESC" ? "DESC" : "ASC";
      dataSql += ` ORDER BY ${sortCol} ${sortOrder}`;
    } else {
      dataSql += " ORDER BY name ASC";
    }

    dataSql += " LIMIT ? OFFSET ?";
    const dataParams = [...params, limitNum, offset];

    db.all(dataSql, dataParams, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        data: rows,
        pagination: {
          current: pageNum,
          limit: limitNum,
          total: total,
          pages: Math.ceil(total / limitNum),
        },
      });
    });
  });
});

module.exports = router;
