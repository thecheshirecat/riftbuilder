const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('riftbound.db');

db.get('SELECT COUNT(*) as count FROM cards', (err, row) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Total cards in database:', row.count);
  }
  db.close();
});