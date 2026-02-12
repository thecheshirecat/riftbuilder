const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "riftbound.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Actualizar todos los mazos para que pertenezcan al usuario 1 (que ya existe)
  db.run("UPDATE decks SET user_id = 1", function (err) {
    if (err) {
      console.error("Error al actualizar los mazos:", err.message);
    } else {
      console.log(
        `Éxito: Se han asignado ${this.changes} mazos al usuario con ID 1.`,
      );
    }
    db.close();
  });
});
