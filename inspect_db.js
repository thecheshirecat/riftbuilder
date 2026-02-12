const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'server', 'riftbound.db');
const db = new sqlite3.Database(dbPath);
db.all("SELECT name, type, supertype, tags FROM cards WHERE name LIKE '%Volibear%' OR name LIKE '%Annie%' OR supertype LIKE '%Signature%' LIMIT 50", [], (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.table(rows);
  }
  db.close();
});
