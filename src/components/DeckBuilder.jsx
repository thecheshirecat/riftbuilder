import React, { useMemo } from "react";
import CardItem from "./CardItem";
import "./Deck.css";
import "./DeckBuilder.css";

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

const BuilderSection = ({
  title,
  cards,
  limit,
  addCardToDeck,
  removeCardFromDeck,
  setSelectedCard,
  isSideboard = false,
}) => {
  const grouped = useMemo(() => groupCards(cards), [cards]);

  return (
    <div
      className={`deck-section-internal grid-visual ${isSideboard ? "sideboard-section" : ""}`}
    >
      <h3>
        {title} ({cards.length}
        {limit ? `/${limit}` : ""})
      </h3>
      <div className="deck-grid-visual">
        {grouped.map((card, index) => (
          <CardItem
            key={`${card.id}-${index}`}
            card={card}
            quantity={card.quantity}
            onAdd={() => addCardToDeck(card, isSideboard)}
            onRemove={() => removeCardFromDeck(card.id, isSideboard)}
            onRightClick={setSelectedCard}
            viewMode="grid"
          />
        ))}
        {/* Botón rápido para añadir al sideboard si está vacío o tiene espacio */}
        {isSideboard && cards.length < 8 && (
          <div className="sideboard-placeholder">
            <span>Add cards from list...</span>
          </div>
        )}
      </div>
    </div>
  );
};

const DeckBuilder = ({
  selectedDeck,
  deck,
  onDeleteDeck,
  setMainChampionId,
  mainChampionId,
  updateDeckMetadata,
  setIsEditingMode,
  removeCardFromDeck,
  addCardToDeck,
  setSelectedCard,
  validation,
}) => {
  const [isEditingMetadata, setIsEditingMetadata] = React.useState(false);
  const [editName, setEditName] = React.useState(selectedDeck.name);
  const [editDesc, setEditDesc] = React.useState(
    selectedDeck.description || "",
  );

  const handleSaveMetadata = () => {
    updateDeckMetadata(selectedDeck.id, {
      name: editName,
      description: editDesc,
    });
    setIsEditingMetadata(false);
  };

  const {
    isValid,
    isDeckComplete,
    hasLegend,
    battlefieldsCount,
    mainDeckCount,
    runesCount,
    runesMatchDomain,
    validChampions,
    mainChampIsValid,
    legend,
    battlefields,
    mainDeck,
    runes,
    sideboard,
    sideboardCount,
    hasSideboardValidSize,
    copiesLimitValid,
    excessiveCopies,
    legendTags,
    legendDomains,
  } = validation;

  return (
    <div className="deck-container edit-mode-active grid-mode">
      {/* Header Edición */}
      <div className="deck-header">
        <div className="deck-header-top">
          <div className="deck-status-badges">
            <div
              className={`validation-status ${isValid ? "valid" : "invalid"}`}
            >
              {isValid ? "✅ Valid Deck" : "⚠️ Incomplete"}
            </div>
          </div>
          <div className="deck-header-actions">
            <button
              className="toggle-edit-btn active"
              onClick={() => setIsEditingMode(false)}
            >
              Stop Editing
            </button>
            <button
              className="delete-deck-btn-builder"
              onClick={() => onDeleteDeck(selectedDeck.id)}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="deck-header-main">
          {isEditingMetadata ? (
            <div className="deck-metadata-edit-form">
              <input
                type="text"
                className="edit-deck-name-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
              <textarea
                className="edit-deck-desc-input"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Add a deck description..."
              />
              <div className="edit-metadata-actions">
                <button className="btn-save-meta" onClick={handleSaveMetadata}>
                  Save
                </button>
                <button
                  className="btn-cancel-meta"
                  onClick={() => setIsEditingMetadata(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className="deck-title-area clickable"
              onClick={() => setIsEditingMetadata(true)}
            >
              <h2 className="deck-title">{selectedDeck.name}</h2>
              {selectedDeck.description && (
                <p className="deck-description">{selectedDeck.description}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Errores Validación */}
      {!isValid && (
        <div className="deck-validation-details">
          {!hasLegend && <p className="err">Missing Legend (1 required)</p>}
          {battlefieldsCount !== 3 && (
            <p className="err">Battlefields: {battlefieldsCount}/3</p>
          )}
          {mainDeckCount !== 40 && (
            <p className="err">Main Deck: {mainDeckCount}/40</p>
          )}
          {runesCount !== 12 && <p className="err">Runes: {runesCount}/12</p>}
          {!hasSideboardValidSize && (
            <p className="err highlight">
              Sideboard: {sideboardCount}/8 (Max 8 exceeded!)
            </p>
          )}
          {!copiesLimitValid &&
            excessiveCopies.map(([name, count]) => (
              <p key={name} className="err highlight">
                ⚠️ Too many copies of '{name}' ({count} total in Main +
                Sideboard)
              </p>
            ))}
          {runesCount > 0 && !runesMatchDomain && (
            <p className="err highlight">
              ⚠️ Some Runes don't match your Legend's domain (
              {legendDomains.join(", ")})!
            </p>
          )}
          {isDeckComplete && validChampions.length === 0 && (
            <p className="err highlight">
              ⚠️ No Champions in your deck share a tag with {legend?.name}!
            </p>
          )}
          {isDeckComplete && validChampions.length > 0 && !mainChampIsValid && (
            <p className="err highlight">
              ⚠️ Please select a valid Main Champion below.
            </p>
          )}
        </div>
      )}

      {/* Selección Campeón */}
      {isDeckComplete && validChampions.length > 0 && (
        <div className="champion-selection-section">
          <h3>Select Main Champion</h3>
          <p className="champion-hint">
            Choose a Champion that shares a tag with your Legend (
            {legendTags.join(", ")})
          </p>
          <div className="champion-grid-select">
            {validChampions.map((champ) => (
              <div
                key={champ.id}
                className={`champ-select-card ${mainChampionId === champ.id ? "selected" : ""}`}
                onClick={() => setMainChampionId(selectedDeck.id, champ.id)}
              >
                <span className="champ-name">{champ.name}</span>
                <span className="champ-tags-mini">{champ.tags}</span>
                {mainChampionId === champ.id && (
                  <span className="check-mark">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout Grid (Única opción en Builder) */}
      <div className="deck-layout grid-display">
        <BuilderSection
          title="Legend"
          cards={legend ? [legend] : []}
          limit={1}
          addCardToDeck={addCardToDeck}
          removeCardFromDeck={removeCardFromDeck}
          setSelectedCard={setSelectedCard}
        />
        <BuilderSection
          title="Battlefields"
          cards={battlefields}
          limit={3}
          addCardToDeck={addCardToDeck}
          removeCardFromDeck={removeCardFromDeck}
          setSelectedCard={setSelectedCard}
        />
        <BuilderSection
          title="Main Deck"
          cards={mainDeck}
          limit={40}
          addCardToDeck={addCardToDeck}
          removeCardFromDeck={removeCardFromDeck}
          setSelectedCard={setSelectedCard}
        />
        <BuilderSection
          title="Runes"
          cards={runes}
          limit={12}
          addCardToDeck={addCardToDeck}
          removeCardFromDeck={removeCardFromDeck}
          setSelectedCard={setSelectedCard}
        />
        <BuilderSection
          title="Sideboard"
          cards={sideboard}
          limit={8}
          addCardToDeck={addCardToDeck}
          removeCardFromDeck={removeCardFromDeck}
          setSelectedCard={setSelectedCard}
          isSideboard={true}
        />
      </div>
    </div>
  );
};

export default DeckBuilder;
