import React, { useMemo } from "react";
import CardItem from "./CardItem";
import "./Deck.css";
import "./DeckView.css";

const groupCards = (cards) => {
  if (!cards) return [];
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

const ViewSection = ({ title, cards, limit, viewMode, setSelectedCard }) => {
  const grouped = useMemo(() => groupCards(cards), [cards]);
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
  const {
    isValid,
    legend,
    battlefields,
    mainDeck,
    runes,
    sideboard,
    mainChampionId,
    validChampions,
  } = validation;

  const runesGrouped = useMemo(() => groupCards(runes), [runes]);

  return (
    <div className={`deck-container view-mode-active ${viewMode}-mode`}>
      {/* Hero Public View */}
      <div className="deck-hero-section">
        <div className="deck-header-top">
          <div className="deck-view-actions">
            <button
              className="toggle-edit-btn primary"
              onClick={() => setIsEditingMode(true)}
            >
              Edit This Deck
            </button>
          </div>
        </div>
        <h1 className="deck-hero-title">{selectedDeck.name}</h1>
        {selectedDeck.description && (
          <p className="deck-hero-description">{selectedDeck.description}</p>
        )}
        <div className="deck-hero-meta">
          <div className="view-mode-toggle">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              List
            </button>
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
            {mainChampionId &&
              validChampions
                .filter((c) => c.id === mainChampionId)
                .map((champ) => (
                  <CardItem
                    key={champ.id}
                    card={champ}
                    quantity={1}
                    onRightClick={setSelectedCard}
                    viewMode="grid"
                  />
                ))}
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
        <div className="deck-main-sections">
          <ViewSection
            title="Battlefields"
            cards={battlefields}
            limit={3}
            viewMode={viewMode}
            setSelectedCard={setSelectedCard}
          />
          <ViewSection
            title="Main Deck"
            cards={mainDeck}
            limit={40}
            viewMode={viewMode}
            setSelectedCard={setSelectedCard}
          />
          <ViewSection
            title="Runes"
            cards={runes}
            limit={12}
            viewMode={viewMode}
            setSelectedCard={setSelectedCard}
          />
        </div>

        {/* Sideboard Section */}
        {sideboard && sideboard.length > 0 && (
          <div className="deck-sideboard-view-section">
            <ViewSection
              title="Sideboard"
              cards={sideboard}
              viewMode={viewMode}
              setSelectedCard={setSelectedCard}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckView;
