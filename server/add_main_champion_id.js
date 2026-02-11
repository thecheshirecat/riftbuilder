const { db } = require('./database');

db.serialize(() => {
    console.log("Checking for main_champion_id column in decks table...");
    db.all("PRAGMA table_info(decks)", (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        const hasColumn = rows.some(row => row.name === 'main_champion_id');
        if (!hasColumn) {
            console.log("Adding main_champion_id column to decks table...");
            db.run("ALTER TABLE decks ADD COLUMN main_champion_id TEXT", (err) => {
                if (err) {
                    console.error("Error adding column:", err.message);
                } else {
                    console.log("Column added successfully.");
                }
            });
        } else {
            console.log("Column already exists.");
        }
    });
});
