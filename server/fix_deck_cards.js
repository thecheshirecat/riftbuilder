const { db } = require('./database');

db.serialize(() => {
    console.log("Dropping deck_cards table to apply new schema...");
    db.run("DROP TABLE IF EXISTS deck_cards", (err) => {
        if (err) console.error(err.message);
        
        console.log("Recreating deck_cards table without composite primary key...");
        db.run(
          `CREATE TABLE deck_cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            deck_id INTEGER,
            card_id TEXT,
            FOREIGN KEY (deck_id) REFERENCES decks (id),
            FOREIGN KEY (card_id) REFERENCES cards (id)
        )`,
          (err) => {
            if (err) {
              console.error("Error creating deck_cards table :" + err.message);
            } else {
              console.log("Deck_cards table recreated successfully.");
            }
          }
        );
    });
});
