const { db } = require('./database');

const deckId = 1; // Assuming deck 1 exists
const sql = `SELECT c.* FROM cards c
             JOIN deck_cards dc ON c.id = dc.card_id
             WHERE dc.deck_id = ?`;

db.all(sql, [deckId], (err, rows) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log("First 2 cards in deck:");
    console.log(JSON.stringify(rows.slice(0, 5), null, 2));
    db.close();
});
