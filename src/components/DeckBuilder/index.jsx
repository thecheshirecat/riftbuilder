import React, { useMemo } from "react";
import styled from "styled-components";
import CardItem from "../CardItem/index";
import { groupCards, sortCards } from "../../utils/cardUtils";

const DeckContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;

  h3 {
    margin: 0;
    text-align: center;
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: 2px;
  }
`;

const DeckHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${(props) => props.theme.colors.borderColor};
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const DeckHeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ValidationStatus = styled.div`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  line-height: 1;

  &.valid {
    background: rgba(81, 207, 102, 0.15);
    color: ${(props) => props.theme.colors.success};
    border: 1px solid rgba(81, 207, 102, 0.3);
  }

  &.invalid {
    background: rgba(255, 107, 107, 0.15);
    color: ${(props) => props.theme.colors.danger};
    border: 1px solid rgba(255, 107, 107, 0.3);
  }
`;

const ImportButton = styled.button`
  background: rgba(64, 192, 87, 0.1);
  border: 1px solid #51cf66;
  color: #51cf66;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: ${(props) => props.theme.effects.transition};

  &:hover {
    background: #51cf66;
    color: white;
  }
`;

const DeckTitleAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`;

const DeckTitleArea = styled.div`
  padding: 10px;
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: fit-content;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
    border-color: ${(props) => props.theme.colors.borderColor};

    .edit-icon-hint {
      opacity: 0.6;
      transform: translateX(0);
    }

    .deck-title {
      color: ${(props) => props.theme.colors.primary};
    }
  }

  .deck-description {
    color: ${(props) => props.theme.colors.textDim};
    font-size: 0.95rem;
    margin-top: 5px;
    line-height: 1.5;
  }
`;

const DeckTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DeckTitle = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  transition: color 0.2s ease;
`;

const EditIconHint = styled.span`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.primary};
  opacity: 0;
  transition: all 0.2s ease;
  transform: translateX(-5px);
`;

const VisibilityBadge = styled.span`
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-left: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${(props) => props.theme.colors.borderColor};

  &.public {
    color: #52c41a;
    background: rgba(82, 196, 26, 0.1);
    border-color: rgba(82, 196, 26, 0.2);
  }

  &.unlisted {
    color: #faad14;
    background: rgba(250, 173, 20, 0.1);
    border-color: rgba(250, 173, 20, 0.2);
  }

  &.private {
    color: #f5222d;
    background: rgba(245, 34, 45, 0.1);
    border-color: rgba(245, 34, 45, 0.2);
  }
`;

const DeckManagementButtons = styled.div`
  display: flex;
  gap: 12px;
  padding-left: 10px;
`;

const ToggleEditButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: ${(props) => props.theme.effects.transition};
  border: 1px solid ${(props) => props.theme.colors.border};
  background: rgba(255, 255, 255, 0.05);
  color: ${(props) => props.theme.colors.textMain};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: rgba(77, 171, 247, 0.2);
    border-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
  }
`;

const DeleteDeckButton = styled.button`
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid ${(props) => props.theme.colors.danger};
  color: ${(props) => props.theme.colors.danger};
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: ${(props) => props.theme.effects.transition};

  &:hover {
    background: ${(props) => props.theme.colors.danger};
    color: white;
  }
`;

const MetadataEditForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EditInput = styled.input`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid ${(props) => props.theme.colors.primary};
  color: white;
  font-size: 1.4rem;
  padding: 8px 12px;
  border-radius: 8px;
  outline: none;
  font-weight: 700;
`;

const EditTextarea = styled.textarea`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid ${(props) => props.theme.colors.border};
  color: ${(props) => props.theme.colors.textMain};
  padding: 8px 12px;
  border-radius: 8px;
  outline: none;
  min-height: 80px;
  resize: vertical;
`;

const VisibilitySelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 5px 0;

  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: ${(props) => props.theme.colors.textDim};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const VisibilityOptions = styled.div`
  display: flex;
  gap: 8px;
`;

const VisibilityOption = styled.button`
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 8px;
  color: ${(props) => props.theme.colors.textDim};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${(props) => props.theme.colors.textMain};
  }

  &.active {
    background: rgba(77, 171, 247, 0.15);
    border-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
  }
`;

const MetadataActions = styled.div`
  display: flex;
  gap: 10px;
`;

const MetadataButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: ${(props) => props.theme.effects.transition};

  &.save {
    background: ${(props) => props.theme.colors.primary};
    color: white;
    border: none;
    &:hover {
      background: #74c0fc;
    }
  }

  &.cancel {
    background: transparent;
    border: 1px solid ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.textDim};
    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: ${(props) => props.theme.colors.textMain};
    }
  }
`;

const ValidationContainer = styled.div`
  padding: 0 15px;
`;

const ValidationDetails = styled.div`
  background: rgba(255, 107, 107, 0.05);
  border: 1px solid rgba(255, 107, 107, 0.1);
  border-radius: 12px;
  padding: 16px;

  .err {
    margin: 5px 0;
    font-size: 0.9rem;
    color: ${(props) => props.theme.colors.danger};
    &.highlight {
      color: #ff5252;
      font-weight: 700;
    }
  }
`;

const BuilderContainer = styled.div`
  padding: 15px;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ChampionSelectionSection = styled.div`
  padding: 16px;
  background: rgba(20, 20, 20, 0.4);
  border-radius: 12px;
  border: 1px solid ${(props) => props.theme.colors.borderColor};
`;

const ChampionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  margin-top: 15px;
`;

const ChampSelectCard = styled.div`
  background: #222;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #333;
  cursor: pointer;
  transition: ${(props) => props.theme.effects.transition};
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.selected {
    background: rgba(77, 171, 247, 0.1);
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 10px ${(props) => props.theme.colors.primaryGlow};
  }

  .champ-name {
    font-weight: 600;
    font-size: 0.85rem;
    color: ${(props) => props.theme.colors.textMain};
  }

  .champ-tags-mini {
    font-size: 0.7rem;
    color: ${(props) => props.theme.colors.textDim};
  }

  .check-mark {
    position: absolute;
    top: 5px;
    right: 8px;
    color: ${(props) => props.theme.colors.primary};
    font-weight: bold;
  }
`;

const DeckLayout = styled.div`
  display: grid;
  gap: 15px;
`;

const StyledBuilderSection = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 120px;
  transition: all 0.2s ease;

  &.active-context {
    border-color: ${(props) => props.theme.colors.primary};
    background: rgba(77, 171, 247, 0.05);
    box-shadow: 0 0 10px ${(props) => props.theme.colors.primaryGlow};

    h3 {
      color: ${(props) => props.theme.colors.primary};
    }
  }

  h3 {
    cursor: default !important;
    color: ${(props) => props.theme.colors.textMain};
    opacity: 0.8;
  }
`;

const DeckGridVisual = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;

  @media (max-width: ${(props) => props.theme.breakpoints.desktop}) {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 14px;
  }
  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
  }
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
`;

const BuilderSection = ({
  title,
  cards,
  limit,
  addCardToDeck,
  removeCardFromDeck,
  setSelectedCard,
  isSideboard = false,
  onClick,
  isActive,
  sort,
  order,
}) => {
  const sortedCards = useMemo(() => {
    return sortCards(cards, sort, order);
  }, [cards, sort, order]);

  const grouped = useMemo(() => groupCards(sortedCards), [sortedCards]);

  return (
    <StyledBuilderSection
      className={`${isSideboard ? "sideboard-section" : ""} ${isActive ? "active-context" : ""}`}
      onClick={onClick}
    >
      <h3>
        {title} ({cards.length}
        {limit ? `/${limit}` : ""})
      </h3>
      <DeckGridVisual>
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
      </DeckGridVisual>
    </StyledBuilderSection>
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
  onImportDeck,
  removeCardFromDeck,
  addCardToDeck,
  setSelectedCard,
  validation,
  onSectionClick,
  activeSection,
  sort,
  order,
}) => {
  const [isEditingMetadata, setIsEditingMetadata] = React.useState(false);
  const [editName, setEditName] = React.useState(selectedDeck?.name || "");
  const [editDesc, setEditDesc] = React.useState(
    selectedDeck?.description || "",
  );
  const [editVisibility, setEditVisibility] = React.useState(
    selectedDeck?.visibility || "public",
  );

  // Sync state with selectedDeck when it changes (especially when starting edit)
  React.useEffect(() => {
    if (isEditingMetadata && selectedDeck) {
      setEditName(selectedDeck.name || "");
      setEditDesc(selectedDeck.description || "");
      setEditVisibility(selectedDeck.visibility || "public");
    }
  }, [isEditingMetadata, selectedDeck]);

  // Sync is_valid when validation changes
  React.useEffect(() => {
    if (selectedDeck?.id && validation.isValid !== undefined) {
      // Solo actualizamos si el valor en DB es diferente al actual
      if (selectedDeck.is_valid !== (validation.isValid ? 1 : 0)) {
        updateDeckMetadata(selectedDeck.id, { is_valid: validation.isValid });
      }
    }
  }, [
    validation.isValid,
    selectedDeck?.id,
    selectedDeck?.is_valid,
    updateDeckMetadata,
  ]);

  const handleSaveMetadata = () => {
    if (!selectedDeck?.id) return;
    updateDeckMetadata(selectedDeck.id, {
      name: editName,
      description: editDesc,
      visibility: editVisibility,
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
    <DeckContainer className="edit-mode-active grid-mode">
      {/* Header Edición */}
      <DeckHeader>
        <DeckHeaderTop>
          <div className="deck-status-badges">
            <ValidationStatus className={isValid ? "valid" : "invalid"}>
              {isValid ? "✅ Valid Deck" : "Incomplete"}
            </ValidationStatus>
          </div>
          <div className="deck-header-actions">
            <ImportButton
              onClick={onImportDeck}
              title="Import deck from clipboard list"
            >
              📥 Import
            </ImportButton>
          </div>
        </DeckHeaderTop>
        <div className="deck-header-main">
          {isEditingMetadata ? (
            <MetadataEditForm>
              <EditInput
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
              <EditTextarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Add a deck description..."
              />
              <VisibilitySelector>
                <label>Visibility:</label>
                <VisibilityOptions>
                  <VisibilityOption
                    type="button"
                    className={editVisibility === "public" ? "active" : ""}
                    onClick={() => setEditVisibility("public")}
                    title="Everyone can see this deck and it will appear in public lists."
                  >
                    🌍 Public
                  </VisibilityOption>
                  <VisibilityOption
                    type="button"
                    className={editVisibility === "unlisted" ? "active" : ""}
                    onClick={() => setEditVisibility("unlisted")}
                    title="Anyone with the link can see this deck, but it won't appear in public lists."
                  >
                    🔗 Unlisted
                  </VisibilityOption>
                  <VisibilityOption
                    type="button"
                    className={editVisibility === "private" ? "active" : ""}
                    onClick={() => setEditVisibility("private")}
                    title="Only you can see this deck."
                  >
                    🔒 Private
                  </VisibilityOption>
                </VisibilityOptions>
              </VisibilitySelector>
              <MetadataActions>
                <MetadataButton className="save" onClick={handleSaveMetadata}>
                  Save
                </MetadataButton>
                <MetadataButton
                  className="cancel"
                  onClick={() => setIsEditingMetadata(false)}
                >
                  Cancel
                </MetadataButton>
              </MetadataActions>
            </MetadataEditForm>
          ) : (
            <DeckTitleAreaContainer>
              <DeckTitleArea
                onClick={() => setIsEditingMetadata(true)}
                title="Click to edit deck name and description"
              >
                <DeckTitleWrapper>
                  <DeckTitle className="deck-title">
                    {selectedDeck?.name || "Untitled Deck"}
                  </DeckTitle>
                  <EditIconHint className="edit-icon-hint">✎</EditIconHint>
                  <VisibilityBadge
                    className={selectedDeck?.visibility || "public"}
                  >
                    {selectedDeck?.visibility === "private"
                      ? "🔒 Private"
                      : selectedDeck?.visibility === "unlisted"
                        ? "🔗 Unlisted"
                        : "🌍 Public"}
                  </VisibilityBadge>
                </DeckTitleWrapper>
                {selectedDeck?.description && (
                  <p className="deck-description">{selectedDeck.description}</p>
                )}
              </DeckTitleArea>

              <DeckManagementButtons>
                <ToggleEditButton
                  className="active"
                  onClick={() => setIsEditingMode && setIsEditingMode(false)}
                >
                  Finish Editing
                </ToggleEditButton>
                <DeleteDeckButton
                  onClick={() =>
                    selectedDeck?.id && onDeleteDeck(selectedDeck.id)
                  }
                >
                  Delete Deck
                </DeleteDeckButton>
              </DeckManagementButtons>
            </DeckTitleAreaContainer>
          )}
        </div>
      </DeckHeader>

      {/* Errores Validación */}
      {!isValid && (
        <ValidationContainer>
          <ValidationDetails>
            {!hasLegend && <p className="err">Missing Legend</p>}
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
            {isDeckComplete &&
              validChampions.length > 0 &&
              !mainChampIsValid && (
                <p className="err highlight">
                  ⚠️ Please select a valid Main Champion below.
                </p>
              )}
          </ValidationDetails>
        </ValidationContainer>
      )}

      <BuilderContainer>
        {/* Selección Campeón */}
        {isDeckComplete && validChampions.length > 0 && (
          <ChampionSelectionSection>
            <h3>Select Main Champion</h3>
            <p className="champion-hint">
              Choose a Champion that shares a tag with your Legend (
              {legendTags.join(", ")})
            </p>
            <ChampionGrid>
              {validChampions.map((champ) => (
                <ChampSelectCard
                  key={champ.id}
                  className={mainChampionId === champ.id ? "selected" : ""}
                  onClick={() =>
                    selectedDeck?.id &&
                    setMainChampionId(selectedDeck.id, champ.id)
                  }
                >
                  <span className="champ-name">{champ.name}</span>
                  <span className="champ-tags-mini">{champ.tags}</span>
                  {mainChampionId === champ.id && (
                    <span className="check-mark">✓</span>
                  )}
                </ChampSelectCard>
              ))}
            </ChampionGrid>
          </ChampionSelectionSection>
        )}

        {/* Layout Grid (Única opción en Builder) */}
        <DeckLayout>
          <BuilderSection
            title="Legend"
            cards={legend ? [legend] : []}
            limit={1}
            addCardToDeck={addCardToDeck}
            removeCardFromDeck={removeCardFromDeck}
            setSelectedCard={setSelectedCard}
            onClick={() => onSectionClick && onSectionClick("legend")}
            isActive={activeSection === "legend"}
            sort={sort}
            order={order}
          />
          <BuilderSection
            title="Battlefields"
            cards={battlefields}
            limit={3}
            addCardToDeck={addCardToDeck}
            removeCardFromDeck={removeCardFromDeck}
            setSelectedCard={setSelectedCard}
            onClick={() => onSectionClick && onSectionClick("battlefield")}
            isActive={activeSection === "battlefield"}
            sort={sort}
            order={order}
          />
          <BuilderSection
            title="Main Deck"
            cards={mainDeck}
            limit={40}
            addCardToDeck={addCardToDeck}
            removeCardFromDeck={removeCardFromDeck}
            setSelectedCard={setSelectedCard}
            onClick={() => onSectionClick && onSectionClick("main")}
            isActive={activeSection === "main"}
            sort={sort}
            order={order}
          />
          <BuilderSection
            title="Runes"
            cards={runes}
            limit={12}
            addCardToDeck={addCardToDeck}
            removeCardFromDeck={removeCardFromDeck}
            setSelectedCard={setSelectedCard}
            onClick={() => onSectionClick && onSectionClick("runes")}
            isActive={activeSection === "runes"}
            sort={sort}
            order={order}
          />
          <BuilderSection
            title="Sideboard"
            cards={sideboard}
            limit={8}
            addCardToDeck={addCardToDeck}
            removeCardFromDeck={removeCardFromDeck}
            setSelectedCard={setSelectedCard}
            isSideboard={true}
            onClick={() => onSectionClick && onSectionClick("sideboard")}
            isActive={activeSection === "sideboard"}
            sort={sort}
            order={order}
          />
        </DeckLayout>
      </BuilderContainer>
    </DeckContainer>
  );
};

export default DeckBuilder;
