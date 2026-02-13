import React, { useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import CardItem from "../CardItem/index";
import { groupCards, sortCards } from "../../utils/cardUtils";
import { useToast } from "../Toast/index";

const dropdownFade = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Nav = styled.nav`
  position: sticky;
  top: 70px;
  z-index: 100;
  background: rgba(13, 14, 18, 0.9);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const NavCenter = styled.div`
  display: flex;
  gap: 12px;
`;

const NavRight = styled.div`
  display: flex;
  gap: 12px;
`;

const PillContainer = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 3px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &.sort-selector {
    button {
      padding: 5px 10px;
      min-width: 35px;
      font-size: 0.85rem;
      justify-content: center;
    }
  }
`;

const PillButton = styled.button`
  background: transparent;
  border: none;
  color: ${(props) => (props.active ? "white" : "rgba(255, 255, 255, 0.6)")};
  padding: 5px 12px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  background-color: ${(props) =>
    props.active ? props.theme.colors.primary : "transparent"};

  &:hover {
    color: white;
    background-color: ${(props) =>
      props.active ? props.theme.colors.primary : "rgba(255, 255, 255, 0.1)"};
  }

  &.order-toggle {
    color: ${(props) => props.theme.colors.primary} !important;
    font-weight: 800 !important;
  }
`;

const PillIcon = styled.span`
  font-size: 0.9rem;
`;

const SortDivider = styled.div`
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.15);
  margin: 0 3px;
  align-self: center;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  &.edit {
    background: ${(props) => props.theme.colors.primary};
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const ShareContainer = styled.div`
  position: relative;
`;

const ShareDropdown = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: #1a1c23;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  min-width: 220px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 1000;
  animation: ${dropdownFade} 0.2s ease-out;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const ItemIcon = styled.span`
  font-size: 1.1rem;
`;

const DeckContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;

  &.view-mode-active {
    padding-bottom: 50px;
  }
`;

const HeroSection = styled.div`
  padding: 40px 30px;
  text-align: center;
  background: linear-gradient(
    180deg,
    rgba(77, 171, 247, 0.05) 0%,
    transparent 100%
  );

  h1 {
    margin-bottom: 15px;
  }
`;

const Description = styled.p`
  max-width: 800px;
  margin: 0 auto;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  line-height: 1.6;
  font-style: italic;
`;

const IdentityContainer = styled.div`
  padding: 40px 30px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 100%
  );
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const IdentityGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  justify-content: center;

  .card-item-container,
  & > div {
    width: 220px !important;
    height: auto !important;
  }

  img {
    width: 100% !important;
    height: auto !important;
    object-fit: contain !important;
  }
`;

const DeckLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  padding: 15px;
  padding-top: 0;
  box-sizing: border-box;
`;

const StyledSection = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 15px;
  background: ${(props) =>
    props.isGrid ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.2)"};
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border-radius: 12px;

  h3 {
    margin: 0 0 15px 0;
    text-align: center;
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: 2px;
  }
`;

const GridVisual = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
`;

const ListMini = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 24px;
  margin-top: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  cursor: pointer;
  transition: ${(props) => props.theme.effects.transition};

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const ItemQty = styled.span`
  background: rgba(255, 255, 255, 0.05);
  color: ${(props) => props.theme.colors.textDim};
  font-weight: 600;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 12px;
  min-width: 24px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: ${(props) => props.theme.effects.transition};

  ${ItemRow}:hover & {
    background: rgba(77, 171, 247, 0.1);
    color: ${(props) => props.theme.colors.primary};
    border-color: rgba(77, 171, 247, 0.3);
  }
`;

const ItemName = styled.span`
  color: ${(props) => props.theme.colors.textMain};
  font-weight: 500;
  font-size: 0.9rem;
`;

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
    <StyledSection isGrid={isGrid}>
      <h3>
        {title} ({cards.length}
        {limit ? `/${limit}` : ""})
      </h3>

      {isGrid ? (
        <GridVisual>
          {grouped.map((card, index) => (
            <CardItem
              key={`${card.id}-${index}`}
              card={card}
              quantity={card.quantity}
              onRightClick={setSelectedCard}
              viewMode="grid"
            />
          ))}
        </GridVisual>
      ) : (
        <ListMini>
          {grouped.map((card, index) => (
            <ItemRow
              key={`${card.name}-${index}`}
              onClick={() => setSelectedCard(card)}
            >
              <ItemQty>x{card.quantity}</ItemQty>
              <ItemName>{card.name}</ItemName>
            </ItemRow>
          ))}
        </ListMini>
      )}
    </StyledSection>
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
    if (legend && legend.name) allCards.push(`1x ${legend.name}`);

    // Agrupar el resto para contar duplicados si no vienen agrupados
    const countMap = {};
    [...battlefields, ...mainDeck, ...runes].forEach((c) => {
      if (c && c.name) {
        countMap[c.name] = (countMap[c.name] || 0) + 1;
      }
    });

    Object.entries(countMap).forEach(([name, qty]) => {
      allCards.push(`${qty}x ${name}`);
    });

    if (sideboard && sideboard.length > 0) {
      allCards.push("\nSideboard:");
      const sbMap = {};
      sideboard.forEach((c) => {
        if (c && c.name) {
          sbMap[c.name] = (sbMap[c.name] || 0) + 1;
        }
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
      <Nav>
        <NavCenter>
          <PillContainer>
            <PillButton
              active={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
            >
              <PillIcon>⠿</PillIcon> Grid
            </PillButton>
            <PillButton
              active={viewMode === "list"}
              onClick={() => setViewMode("list")}
            >
              <PillIcon>☰</PillIcon> List
            </PillButton>
          </PillContainer>

          <PillContainer className="sort-selector">
            <PillButton
              active={sortMode === "name"}
              onClick={() => setSortMode("name")}
              title="Sort by Name"
            >
              A-Z
            </PillButton>
            <PillButton
              active={sortMode === "energy"}
              onClick={() => setSortMode("energy")}
              title="Sort by Energy"
            >
              <PillIcon>Energy</PillIcon>
            </PillButton>
            <PillButton
              active={sortMode === "rarity"}
              onClick={() => setSortMode("rarity")}
              title="Sort by Rarity"
            >
              <PillIcon>Rarity</PillIcon>
            </PillButton>
            <PillButton
              active={sortMode === "type"}
              onClick={() => setSortMode("type")}
              title="Sort by Type"
            >
              <PillIcon>Types</PillIcon>
            </PillButton>

            <SortDivider />

            <PillButton
              className="order-toggle"
              onClick={() =>
                setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"))
              }
              title={sortOrder === "ASC" ? "Ascending" : "Descending"}
            >
              <PillIcon>{sortOrder === "ASC" ? "↑" : "↓"}</PillIcon>
            </PillButton>
          </PillContainer>
        </NavCenter>

        <NavRight>
          {isOwner && (
            <ActionButton
              className="edit"
              onClick={() => setIsEditingMode && setIsEditingMode(true)}
            >
              <PillIcon>✎</PillIcon> Edit Deck
            </ActionButton>
          )}
          <ShareContainer>
            <ActionButton onClick={() => setShowShareMenu(!showShareMenu)}>
              <PillIcon>🔗</PillIcon> Share
            </ActionButton>

            {showShareMenu && (
              <ShareDropdown>
                <DropdownItem onClick={copyUrl}>
                  <ItemIcon>📋</ItemIcon> Copy URL
                </DropdownItem>
                <DropdownItem onClick={exportCardList}>
                  <ItemIcon>📄</ItemIcon> Export Card List
                </DropdownItem>
              </ShareDropdown>
            )}
          </ShareContainer>
        </NavRight>
      </Nav>

      <DeckContainer className="view-mode-active">
        <HeroSection>
          {selectedDeck?.name && <h1>{selectedDeck.name}</h1>}
          {selectedDeck?.description && (
            <Description>{selectedDeck.description}</Description>
          )}
        </HeroSection>

        {legend && (
          <IdentityContainer>
            <IdentityGrid>
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
            </IdentityGrid>
          </IdentityContainer>
        )}

        <DeckLayout>
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
        </DeckLayout>
      </DeckContainer>
    </>
  );
};

export default DeckView;
