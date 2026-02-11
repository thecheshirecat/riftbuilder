const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { db } = require("./database");

const syncDomains = async () => {
  console.log("Starting domain synchronization...");

  try {
    const response = await fetch("https://api.riftcodex.com/index/domains");
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data && data.values && Array.isArray(data.values)) {
        const insert = db.prepare("INSERT OR IGNORE INTO domains (name) VALUES (?)");
        
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            data.values.forEach(domain => {
                insert.run(domain);
            });
            db.run("COMMIT", () => {
                console.log(`Domain sync complete. Synced ${data.values.length} domains.`);
            });
        });
        insert.finalize();
    } else {
        console.error("Invalid domain data format:", data);
    }

  } catch (error) {
    console.error("Error syncing domains:", error);
  }
};

module.exports = syncDomains;

if (require.main === module) {
    syncDomains();
}
