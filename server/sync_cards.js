const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { db } = require("./database");

const syncCards = async (forceUpdate = false) => {
  console.log(`Starting card synchronization... (Force update: ${forceUpdate})`);

  try {
    let allCards = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await fetch(
            `https://api.riftcodex.com/cards?page=${page}`,
        );
        const data = await response.json();
    
        if (data && data.items && Array.isArray(data.items)) {
            allCards = allCards.concat(data.items);
            hasMore = page < data.pages;
            page++;
        } else if (data && data.cards && Array.isArray(data.cards)) {
            allCards = allCards.concat(data.cards);
            hasMore = page < data.pages;
            page++;
        } else if (data && data.data && Array.isArray(data.data)) {
            allCards = allCards.concat(data.data);
            hasMore = page < data.pages;
            page++;
        } else {
            console.log("No valid card array found or end of pagination.");
            hasMore = false;
        }
      } catch (e) {
        console.error(`Error fetching page ${page}:`, e);
        hasMore = false;
      }
    }

    console.log(`Fetched ${allCards.length} cards from API. processing...`);
    
    const conflictClause = "OR REPLACE";
    const insert = db.prepare(
      `INSERT ${conflictClause} INTO cards (id, name, domain, type, supertype, tags, rarity, energy, plain_text, power, might, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    db.serialize(() => {
      let changeCount = 0;
      db.run("BEGIN TRANSACTION");
      
      allCards.forEach((card) => {
        if (card && card.id) {
          // Handle domain which might be array of strings, array of objects, or just a string/object
          let domainStr = "";
          if (Array.isArray(card.classification?.domain)) {
            domainStr = card.classification.domain.map(d => typeof d === 'object' ? (d.name || d.label || JSON.stringify(d)) : d).join(", ");
          } else if (card.classification?.domain) {
            domainStr = typeof card.classification.domain === 'object' ? (card.classification.domain.name || card.classification.domain.label || JSON.stringify(card.classification.domain)) : card.classification.domain;
          }

          // Handle tags
          let tagsStr = "";
          if (Array.isArray(card.tags)) {
            tagsStr = card.tags.join(", ");
          } else if (card.tags) {
            tagsStr = card.tags;
          }

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
            card.attributes?.power ?? 0,
            card.attributes?.might ?? 0,
            card.media?.image_url || "",
            function(err) {
                if (!err && this.changes > 0) {
                    changeCount++;
                }
            }
          );
        }
      });
      
      db.run("COMMIT", () => {
        console.log(`Sync complete. ${changeCount} cards added/updated.`);
      });
    });
    insert.finalize();

  } catch (error) {
    console.error("Error syncing cards:", error);
  }
};

module.exports = syncCards;

// If run directly
if (require.main === module) {
    // Check if 'force' argument is passed
    const force = process.argv.includes('force');
    syncCards(force);
}
