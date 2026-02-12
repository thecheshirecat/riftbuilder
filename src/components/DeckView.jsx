import React, { useMemo, useState } from "react";
import CardItem from "./CardItem";
import { groupCards, sortCards } from "../utils/cardUtils";
import { useToast } from "./Toast";
import "./Deck.css";
import "./DeckView.css";

const ViewSection = ({
  title,
  cards,
  limit,
  viewMode,
  sortMode,
  sortOrder,
  setSelectedCard,
}) => {
  const grouped = useMemo(() => {
    const sorted = sortCards(cards, sortMode, sortOrder);
    return groupCards(sorted);
  }, [cards, sortMode, sortOrder]);

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
  isOwner,
}) => {
  const [sortMode, setSortMode] = useState("name"); // 'name', 'energy', 'rarity', 'type'
  const [sortOrder, setSortOrder] = useState("ASC"); // 'ASC', 'DESC'
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { showToast } = useToast();

  const { legend, battlefields, mainDeck, runes, sideboard, mainChampion } =
    validation;

  /**
   * Copia la URL actual al portapapeles.
   */
  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareMenu(false);
    showToast("URL copied to clipboard!", "success");
  };

  /**
   * Exporta la lista de cartas en formato texto (cantidad x nombre).
   */
  const exportCardList = () => {
    const allCards = [];
    if (legend) allCards.push(`1x ${legend.name}`);

    // Agrupar el resto para contar duplicados si no vienen agrupados
    const countMap = {};
    [...battlefields, ...mainDeck, ...runes].forEach((c) => {
      countMap[c.name] = (countMap[c.name] || 0) + 1;
    });

    Object.entries(countMap).forEach(([name, qty]) => {
      allCards.push(`${qty}x ${name}`);
    });

    if (sideboard && sideboard.length > 0) {
      allCards.push("\nSideboard:");
      const sbMap = {};
      sideboard.forEach((c) => {
        sbMap[c.name] = (sbMap[c.name] || 0) + 1;
      });
      Object.entries(sbMap).forEach(([name, qty]) => {
        allCards.push(`${qty}x ${name}`);
      });
    }

    const text = allCards.join("\n");
    navigator.clipboard.writeText(text);
    setShowShareMenu(false);
    showToast("Card list copied to clipboard!", "success");
  };

  const runesGrouped = useMemo(() => {
    const sorted = sortCards(runes, sortMode, sortOrder);
    return groupCards(sorted);
  }, [runes, sortMode, sortOrder]);

  return (
    <>
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
          {isOwner && (
            <button
              className="nav-action-btn edit"
              onClick={() => setIsEditingMode(true)}
            >
              <span className="btn-icon">✎</span> Edit Deck
            </button>
          )}
          <div className="share-menu-container">
            <button
              className="nav-action-btn share"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <span className="btn-icon">🔗</span> Share
            </button>

            {showShareMenu && (
              <div className="share-dropdown">
                <button className="dropdown-item" onClick={copyUrl}>
                  <span className="item-icon">📋</span> Copy URL
                </button>
                <button className="dropdown-item" onClick={exportCardList}>
                  <span className="item-icon">📄</span> Export Card List
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className={`deck-container view-mode-active ${viewMode}-mode`}>
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
    </>
  );
};

export default DeckView;
