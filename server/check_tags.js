const { db } = require('./database');

db.all("SELECT name, type, supertype, tags FROM cards WHERE name LIKE 'Mechanized Menace' OR name LIKE 'Rumble, Hotheaded'", (err, rows) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log(JSON.stringify(rows, null, 2));
});
