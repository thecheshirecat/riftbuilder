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

  const mainChampion = champions.find((c) => c.id === mainChampionId);

  // Basic Requirements
  const hasLegend = !!legend;
  const hasThreeBattlefields = battlefields.length === 3;
  const hasFortyMainCards = mainDeck.length === 40;
  const hasTwelveRunes = runes.length === 12;
  const sideboardCount = sideboard.length;
  const hasSideboardValidSize = sideboardCount <= 8;
  const isDeckComplete =
    hasLegend &&
    hasThreeBattlefields &&
    hasFortyMainCards &&
    hasTwelveRunes;

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
