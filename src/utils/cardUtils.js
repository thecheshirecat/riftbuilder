/**
 * Robust parsing to avoid NaN when values are empty strings or undefined
 * @param {any} val - The value to parse
 * @param {number} fallback - Fallback if parsing fails
 * @returns {number}
 */
export const safeParse = (val, fallback) => {
  if (val === undefined || val === null || val === "") return fallback;
  const p = parseInt(val);
  return isNaN(p) ? fallback : p;
};

/**
 * Validates a deck based on Riftbound rules
 * @param {Array} deck - Array of card objects
 * @param {string} mainChampionId - ID of the selected main champion
 * @returns {Object} Validation results
 */
export const validateDeck = (deck, mainChampionId) => {
  if (!deck || !Array.isArray(deck)) {
    return {
      isValid: false,
      isDeckComplete: false,
      hasLegend: false,
      battlefieldsCount: 0,
      mainDeckCount: 0,
      runesCount: 0,
      runesMatchDomain: true,
      validChampions: [],
      mainChampIsValid: false,
      legend: null,
      battlefields: [],
      mainDeck: [],
      runes: [],
      legendTags: [],
      legendDomains: [],
    };
  }
  const legend = deck.find((c) => c.type === "Legend" && !c.is_sideboard);
  const battlefields = deck.filter(
    (c) => c.type === "Battlefield" && !c.is_sideboard,
  );
  const runes = deck.filter((c) => c.type === "Rune" && !c.is_sideboard);
  const mainDeck = deck.filter(
    (c) =>
      c.type !== "Legend" &&
      c.type !== "Battlefield" &&
      c.type !== "Rune" &&
      !c.is_sideboard,
  );
  const sideboard = deck.filter((c) => c.is_sideboard);

  const champions = mainDeck.filter(
    (c) => c.type === "Champion" || c.supertype === "Champion",
  );

  const mainChampion = champions.find(
    (c) => String(c.id) === String(mainChampionId),
  );

  // Basic Requirements
  const hasLegend = !!legend;
  const hasThreeBattlefields = battlefields.length === 3;
  const hasFortyMainCards = mainDeck.length === 40;
  const hasTwelveRunes = runes.length === 12;
  const sideboardCount = sideboard.length;
  const hasSideboardValidSize = sideboardCount <= 8;
  const isDeckComplete =
    hasLegend && hasThreeBattlefields && hasFortyMainCards && hasTwelveRunes;

  // Copies Limit Check (Global: Main + Sideboard)
  const globalCardCounts = {};
  deck.forEach((card) => {
    globalCardCounts[card.name] = (globalCardCounts[card.name] || 0) + 1;
  });

  const excessiveCopies = Object.entries(globalCardCounts).filter(
    ([name, count]) => {
      const card = deck.find((c) => c.name === name);
      // No limit for Runes
      if (card.type === "Rune") return false;
      if (card.type === "Legend" || card.type === "Battlefield")
        return count > (card.type === "Legend" ? 1 : 3);
      return count > 3;
    },
  );

  const copiesLimitValid = excessiveCopies.length === 0;

  // Tag Matching Logic for Champions
  const legendTags = legend?.tags?.split(",").map((t) => t.trim()) || [];

  // Domain Matching Logic for Runes
  const legendDomains = legend?.domain?.split(",").map((d) => d.trim()) || [];

  // Find runes that share at least one domain with the Legend
  const validRunes = runes.filter((rune) => {
    const runeDomains = rune.domain?.split(",").map((d) => d.trim()) || [];
    return runeDomains.some((domain) => legendDomains.includes(domain));
  });

  const runesMatchDomain =
    runes.length === 0 || validRunes.length === runes.length;

  // Find champions that share at least one tag with the Legend
  const validChampions = (() => {
    const matching = champions.filter((champ) => {
      const champTags = champ.tags?.split(",").map((t) => t.trim()) || [];
      return champTags.some((tag) => legendTags.includes(tag));
    });

    // Deduplicate by name for selection UI
    const unique = [];
    const seenNames = new Set();
    for (const champ of matching) {
      if (champ.name && !seenNames.has(champ.name)) {
        unique.push(champ);
        seenNames.add(champ.name);
      }
    }
    return unique;
  })();

  const mainChampIsValid =
    mainChampion && validChampions.some((c) => c.name === mainChampion.name);
  // isValid also considers sideboard size and global copy limits
  const isValid =
    isDeckComplete &&
    mainChampIsValid &&
    runesMatchDomain &&
    copiesLimitValid &&
    hasSideboardValidSize;

  return {
    isValid,
    isDeckComplete,
    hasLegend,
    battlefieldsCount: battlefields.length,
    mainDeckCount: mainDeck.length,
    runesCount: runes.length,
    sideboardCount,
    hasSideboardValidSize,
    copiesLimitValid,
    excessiveCopies,
    runesMatchDomain,
    validChampions,
    mainChampion,
    mainChampIsValid,
    legend,
    battlefields,
    mainDeck,
    runes,
    sideboard,
    legendTags,
    legendDomains,
  };
};

/**
 * Groups cards by name and calculates quantities
 * @param {Array} cards - Array of card objects
 * @returns {Array} Array of grouped card objects with a quantity property
 */
export const groupCards = (cards) => {
  if (!cards || !Array.isArray(cards)) return [];
  return cards.reduce((acc, card) => {
    const existing = acc.find((c) => c.name === card.name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      acc.push({ ...card, quantity: 1 });
    }
    return acc;
  }, []);
};

/**
 * Sorts an array of cards based on various modes
 * @param {Array} cards - Array of card objects
 * @param {string} sortMode - Sort mode ('name', 'energy', 'rarity', 'type', 'power', 'might')
 * @param {string} sortOrder - Sort order ('ASC', 'DESC')
 * @returns {Array} Sorted array
 */
export const sortCards = (cards, sortMode = "name", sortOrder = "ASC") => {
  if (!cards || !Array.isArray(cards)) return [];

  const rarityOrder = {
    showcase: 0,
    epic: 1,
    rare: 2,
    uncommon: 3,
    common: 4,
  };

  const typeOrder = {
    Legend: 0,
    Battlefield: 1,
    Champion: 2,
    Unit: 3,
    Spell: 4,
    Gear: 5,
    Rune: 6,
  };

  return [...cards].sort((a, b) => {
    let comparison = 0;

    switch (sortMode) {
      case "energy":
        comparison = (a.energy || 0) - (b.energy || 0);
        break;
      case "rarity":
        comparison =
          (rarityOrder[a.rarity?.toLowerCase()] ?? 5) -
          (rarityOrder[b.rarity?.toLowerCase()] ?? 5);
        break;
      case "type":
        comparison = (typeOrder[a.type] ?? 7) - (typeOrder[b.type] ?? 7);
        break;
      case "power":
        comparison = (a.power || 0) - (b.power || 0);
        break;
      case "might":
        comparison = (a.might || 0) - (b.might || 0);
        break;
      case "name":
      default:
        comparison = (a.name || "").localeCompare(b.name || "");
        break;
    }

    // Fallback to name for stable sort when values are equal
    if (comparison === 0 && sortMode !== "name") {
      comparison = (a.name || "").localeCompare(b.name || "");
    }

    return sortOrder === "ASC" ? comparison : -comparison;
  });
};
