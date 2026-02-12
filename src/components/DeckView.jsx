import React, { useMemo, useState } from "react";
import CardItem from "./CardItem";
import "./Deck.css";
import "./DeckView.css";

const groupCards = (cards, sortMode = "name", sortOrder = "ASC") => {
  if (!cards) return [];

  // First group by name to get quantities
  const grouped = cards.reduce((acc, card) => {
    const existing = acc.find((c) => c.name === card.name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      acc.push({ ...card, quantity: 1 });
    }
    return acc;
  }, []);

  // Then sort the grouped array
  return [...grouped].sort((a, b) => {
    let comparison = 0;
    if (sortMode === "energy") {
      const energyA = a.energy || 0;
      const energyB = b.energy || 0;
      comparison = energyA - energyB;
    } else if (sortMode === "rarity") {
      const rarityOrder = {
        showcase: 0,
        epic: 1,
        rare: 2,
        uncommon: 3,
        common: 4,
      };
      const rarityA = rarityOrder[a.rarity?.toLowerCase()] ?? 5;
      const rarityB = rarityOrder[b.rarity?.toLowerCase()] ?? 5;
      comparison = rarityA - rarityB;
    } else if (sortMode === "type") {
      const typeOrder = {
        Legend: 0,
        Battlefield: 1,
        Champion: 2,
        Unit: 3,
        Spell: 4,
        Gear: 5,
        Rune: 6,
      };
      const typeA = typeOrder[a.type] ?? 7;
      const typeB = typeOrder[b.type] ?? 7;
      comparison = typeA - typeB;
    }

    // If values are equal or we are in name mode, fallback to name
    if (comparison === 0) {
      comparison = a.name.localeCompare(b.name);
    }

    return sortOrder === "ASC" ? comparison : -comparison;
  });
};

const ViewSection = ({
  title,
  cards,
  limit,
  viewMode,
  sortMode,
  sortOrder,
  setSelectedCard,
}) => {
  const grouped = useMemo(
    () => groupCards(cards, sortMode, sortOrder),
    [cards, sortMode, sortOrder],
  );
  const isGrid = viewMode === "grid";

  return (
    <div className={`deck-section-internal ${isGrid ? "grid-visual" : ""}`}>
      <h3>
        {title} ({cards.length}
        {limit ? `/${limit}` : ""})
      </h3>

      {isGrid ? (
        <div className="deck-grid-visual">
          {grouped.map((card, index) => (
            <CardItem
              key={`${card.id}-${index}`}
              card={card}
              quantity={card.quantity}
              onRightClick={setSelectedCard}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div className="deck-list-mini">
          {grouped.map((card, index) => (
            <div
              key={`${card.name}-${index}`}
              className="deck-item-row"
              onClick={() => setSelectedCard(card)}
            >
              <span className="deck-item-qty">x{card.quantity}</span>
              <span className="deck-item-name">{card.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DeckView = ({
  selectedDeck,
  setIsEditingMode,
  setSelectedCard,
  viewMode,
  setViewMode,
  validation,
}) => {
  const [sortMode, setSortMode] = useState("name"); // 'name', 'energy', 'rarity', 'type'
  const [sortOrder, setSortOrder] = useState("ASC"); // 'ASC', 'DESC'

  const { legend, battlefields, mainDeck, runes, sideboard, mainChampion } =
    validation;

  const runesGrouped = useMemo(
    () => groupCards(runes, sortMode, sortOrder),
    [runes, sortMode, sortOrder],
  );

  return (
    <div className={`deck-container view-mode-active ${viewMode}-mode`}>
      {/* Nuevo Header tipo Menú */}
      <nav className="deck-view-navbar">
        <div className="nav-center">
          <div className="view-selector-pill">
            <button
              className={`pill-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <span className="pill-icon">⠿</span> Grid
            </button>
            <button
              className={`pill-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <span className="pill-icon">☰</span> List
            </button>
          </div>

          <div className="view-selector-pill sort-selector">
            <button
              className={`pill-btn ${sortMode === "name" ? "active" : ""}`}
              onClick={() => setSortMode("name")}
              title="Sort by Name"
            >
              A-Z
            </button>
            <button
              className={`pill-btn ${sortMode === "energy" ? "active" : ""}`}
              onClick={() => setSortMode("energy")}
              title="Sort by Energy"
            >
              <span className="pill-icon">Energy</span>
            </button>
            <button
              className={`pill-btn ${sortMode === "rarity" ? "active" : ""}`}
              onClick={() => setSortMode("rarity")}
              title="Sort by Rarity"
            >
              <span className="pill-icon">Rarity</span>
            </button>
            <button
              className={`pill-btn ${sortMode === "type" ? "active" : ""}`}
              onClick={() => setSortMode("type")}
              title="Sort by Type"
            >
              <span className="pill-icon">Types</span>
            </button>

            <div className="sort-divider"></div>

            <button
              className="pill-btn order-toggle"
              onClick={() =>
                setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"))
              }
              title={sortOrder === "ASC" ? "Ascending" : "Descending"}
            >
              <span className="pill-icon">
                {sortOrder === "ASC" ? "↑" : "↓"}
              </span>
            </button>
          </div>
        </div>

        <div className="nav-right">
          <button
            className="nav-action-btn edit"
            onClick={() => setIsEditingMode(true)}
          >
            <span className="btn-icon">✎</span> Edit Deck
          </button>
          <button className="nav-action-btn share">
            <span className="btn-icon">🔗</span> Share
          </button>
        </div>
      </nav>

      {/* Hero Section con descripción y metadatos */}
      <div className="deck-hero-minimal">
        {selectedDeck.name && <h1>{selectedDeck.name}</h1>}
        {selectedDeck.description && (
          <p className="deck-description-text">{selectedDeck.description}</p>
        )}
        <div className="deck-stats-bar">
          <div className="stat-item">
            <span className="stat-label">Main</span>
            <span className="stat-value">{mainDeck.length}/40</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Runes</span>
            <span className="stat-value">{runes.length}/12</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Side</span>
            <span className="stat-value">{sideboard?.length || 0}/8</span>
          </div>
        </div>
      </div>

      {/* Identity Showcase */}
      {legend && (
        <div className="deck-identity-container">
          <h2 className="identity-section-title">Deck Identity</h2>
          <div className="identity-unified-grid">
            <CardItem
              card={legend}
              quantity={1}
              onRightClick={setSelectedCard}
              viewMode="grid"
            />
            {mainChampion && (
              <CardItem
                card={mainChampion}
                quantity={1}
                onRightClick={setSelectedCard}
                viewMode="grid"
              />
            )}
            {runesGrouped.map((card, index) => (
              <CardItem
                key={`${card.id}-${index}`}
                card={card}
                quantity={card.quantity}
                onRightClick={setSelectedCard}
                viewMode="grid"
              />
            ))}
          </div>
        </div>
      )}

      {/* Layout Sections */}
      <div className={`deck-layout ${viewMode}-display`}>
        <ViewSection
          title="Battlefields"
          cards={battlefields}
          limit={3}
          viewMode={viewMode}
          sortMode={sortMode}
          sortOrder={sortOrder}
          setSelectedCard={setSelectedCard}
        />
        <ViewSection
          title="Main Deck"
          cards={mainDeck}
          limit={40}
          viewMode={viewMode}
          sortMode={sortMode}
          sortOrder={sortOrder}
          setSelectedCard={setSelectedCard}
        />

        {/* Sideboard Section */}
        {sideboard && sideboard.length > 0 && (
          <ViewSection
            title="Sideboard"
            cards={sideboard}
            viewMode={viewMode}
            sortMode={sortMode}
            sortOrder={sortOrder}
            setSelectedCard={setSelectedCard}
          />
        )}
      </div>
    </div>
  );
};

export default DeckView;
