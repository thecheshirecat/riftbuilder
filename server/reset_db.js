const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./riftbound.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the Riftbound SQLite database.");
});

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS cards", (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Cards table dropped.");
  });

  db.run(
    `CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        name TEXT,
        domain TEXT,
        type TEXT,
        supertype TEXT,
        tags TEXT,
        rarity TEXT,
        energy INTEGER,
        plain_text TEXT,
        set_id TEXT,
        label TEXT,
        power INTEGER,
        might INTEGER,
        image_url TEXT
    )`,
    (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Cards table created.");
    },
  );
});

db.close();
