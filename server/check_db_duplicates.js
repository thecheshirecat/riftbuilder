const { db } = require('./database');

db.all("SELECT name, COUNT(*) as count FROM cards GROUP BY name HAVING count > 1", (err, rows) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log("Duplicate card names:");
    console.log(JSON.stringify(rows, null, 2));
    
    if (rows.length > 0) {
        const names = rows.map(r => r.name);
        const placeholders = names.map(() => "?").join(",");
        db.all(`SELECT id, name, type, supertype FROM cards WHERE name IN (${placeholders})`, names, (err, details) => {
            if (err) console.error(err.message);
            else console.log("\nDetails for duplicates:");
            console.log(JSON.stringify(details, null, 2));
            db.close();
        });
    } else {
        db.close();
    }
});
