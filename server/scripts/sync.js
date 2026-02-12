const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { db } = require("../database");

const syncDomains = async () => {
  console.log("Starting domain synchronization...");
  try {
    const response = await fetch("https://api.riftcodex.com/index/domains");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data && data.values && Array.isArray(data.values)) {
      return new Promise((resolve, reject) => {
        const insert = db.prepare(
          "INSERT OR IGNORE INTO domains (name) VALUES (?)",
        );
        db.serialize(() => {
          db.run("BEGIN TRANSACTION");
          data.values.forEach((domain) => insert.run(domain));
          db.run("COMMIT", (err) => {
            if (err) {
              console.error("Error committing domain sync:", err);
              reject(err);
            } else {
              console.log(
                `Domain sync complete. Synced ${data.values.length} domains.`,
              );
              resolve();
            }
          });
        });
        insert.finalize();
      });
    }
  } catch (error) {
    console.error("Error syncing domains:", error);
  }
};

const syncCards = async (forceUpdate = false) => {
  console.log(
    `Starting card synchronization... (Force update: ${forceUpdate})`,
  );
  try {
    let allCards = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.riftcodex.com/cards?page=${page}`,
      );
      const data = await response.json();
      const items = data.items || data.cards || data.data || [];

      if (items.length > 0) {
        allCards = allCards.concat(items);
        hasMore = page < data.pages;
        page++;
      } else {
        hasMore = false;
      }
    }

    console.log(`Fetched ${allCards.length} cards from API. Processing...`);

    const insert = db.prepare(
      `INSERT OR REPLACE INTO cards (id, name, domain, type, supertype, tags, rarity, energy, plain_text, rich_text, set_id, label, power, might, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    db.serialize(() => {
      let changeCount = 0;
      db.run("BEGIN TRANSACTION");

      allCards.forEach((card) => {
        if (!card?.id) return;

        const domainStr = Array.isArray(card.classification?.domain)
          ? card.classification.domain
              .map((d) => (typeof d === "object" ? d.name || d.label : d))
              .join(", ")
          : typeof card.classification?.domain === "object"
            ? card.classification.domain.name ||
              card.classification.domain.label
            : card.classification?.domain || "";

        const tagsStr = Array.isArray(card.tags)
          ? card.tags.join(", ")
          : card.tags || "";

        insert.run(
          card.id,
          card.name || "",
          domainStr,
          card.classification?.type || "",
          card.classification?.supertype || "",
          tagsStr,
          card.classification?.rarity || "",
          card.attributes?.energy ?? 0,
          card.text?.plain || "",
          card.text?.rich || "",
          card.set?.set_id || "",
          card.set?.label || "",
          card.attributes?.power ?? 0,
          card.attributes?.might ?? 0,
          card.media?.image_url || "",
          function (err) {
            if (!err && this.changes > 0) changeCount++;
          },
        );
      });

      db.run("COMMIT", () =>
        console.log(`Card sync complete. ${changeCount} cards added/updated.`),
      );
    });
    insert.finalize();
  } catch (error) {
    console.error("Error syncing cards:", error);
  }
};

const fullSync = async (force = false) => {
  await syncDomains();
  await syncCards(force);
};

module.exports = { syncCards, syncDomains, fullSync };

if (require.main === module) {
  fullSync(process.argv.includes("force"));
}
