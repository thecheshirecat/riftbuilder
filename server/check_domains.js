const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('riftbound.db');

db.all("SELECT DISTINCT domain FROM cards", [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Domains found in DB:", rows);
        // Domains might be comma-separated strings, so we need to parse them
        const allDomains = new Set();
        rows.forEach(r => {
            if (r.domain) {
                r.domain.split(',').map(d => d.trim()).forEach(d => allDomains.add(d));
            }
        });
        console.log("Unique Domains:", Array.from(allDomains).sort());
    }
    db.close();
});
