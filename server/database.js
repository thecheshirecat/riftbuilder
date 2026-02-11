const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "riftbound.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database " + dbPath + ": " + err.message);
  } else {
    console.log("Connected to the Riftbound SQLite database.");
  }
});

const initSchema = () => {
    db.serialize(() => {
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
              power INTEGER,
              might INTEGER,
              image_url TEXT
          )`,
          (err) => {
            if (err) {
              return console.error("Error creating cards table: " + err.message);
            }
            console.log("Cards table initialized.");
          }
        );
    
        db.run(
          `CREATE TABLE IF NOT EXISTS decks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            main_champion_id TEXT
        )`,
          (err) => {
            if (err) {
              return console.error("Error creating decks table: " + err.message);
            }
            console.log("Decks table initialized.");
            
            // Migration: Add description column if it doesn't exist
            db.all("PRAGMA table_info(decks)", (err, columns) => {
              if (err) return;
              const hasDescription = columns.some(c => c.name === 'description');
              if (!hasDescription) {
                db.run("ALTER TABLE decks ADD COLUMN description TEXT");
              }
            });
          }
        );
    
        db.run(
          `CREATE TABLE IF NOT EXISTS deck_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deck_id INTEGER,
            card_id TEXT,
            is_sideboard INTEGER DEFAULT 0,
            FOREIGN KEY (deck_id) REFERENCES decks (id),
            FOREIGN KEY (card_id) REFERENCES cards (id)
        )`,
          (err) => {
            if (err) {
              return console.error("Error creating deck_cards table :" + err.message);
            }
            console.log("Deck_cards table initialized.");

            // Migration: Add is_sideboard column if it doesn't exist
            db.all("PRAGMA table_info(deck_cards)", (err, columns) => {
              if (err) return;
              const hasSideboard = columns.some(c => c.name === 'is_sideboard');
              if (!hasSideboard) {
                db.run("ALTER TABLE deck_cards ADD COLUMN is_sideboard INTEGER DEFAULT 0");
              }
            });
          }
        );

        db.run(
            `CREATE TABLE IF NOT EXISTS domains (
              name TEXT PRIMARY KEY
          )`,
            (err) => {
              if (err) {
                return console.error("Error creating domains table :" + err.message);
              }
              console.log("Domains table initialized.");
            }
          );
      });
};

module.exports = { db, initSchema };
