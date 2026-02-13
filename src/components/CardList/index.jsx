import React from "react";
import styled from "styled-components";
import CardItem from "../CardItem/index";

const ListContainer = styled.div`
  padding: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const ScrollWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
  position: relative;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.bgDark};
  }

  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
`;

const ListGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;
  padding: 25px;
  align-content: start;

  &.grid-mode {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
    padding: 20px;
  }

  &.list-mode {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
  }
`;

const ItemWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: ${props => props.theme.colors.bgDark};
  border-top: 1px solid ${props => props.theme.colors.borderColor};
`;

const PageBtn = styled.button`
  background: ${props => props.theme.colors.bgCard};
  border: 1px solid ${props => props.theme.colors.borderColor};
  color: ${props => props.theme.colors.textMain};
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  font-weight: 600;

  &:hover:not(:disabled) {
    background: #333;
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: ${props => props.theme.colors.textDim};
  font-size: 0.9rem;
  font-weight: 500;
`;

const Message = styled.div`
  padding: 40px;
  text-align: center;
  color: ${props => props.theme.colors.textDim};
  font-size: 1.1rem;
`;

function CardList({
  cards,
  pagination,
  setPage,
  setSelectedCard,
  addCardToDeck,
  removeCardFromDeck,
  cardCounts = {},
  viewMode = "grid",
}) {
  if (!cards || cards.length === 0) {
    return (
      <Message>No cards found matching your criteria.</Message>
    );
  }

  return (
    <ListContainer>
      <ScrollWrapper className="custom-scrollbar">
        <ListGrid className={`${viewMode}-mode user-select-none`}>
          {cards.map((card, index) => (
            <ItemWrapper key={card.id || `${card.name}-${index}`}>
              <CardItem
                card={card}
                onRightClick={setSelectedCard}
                onAdd={addCardToDeck}
                onRemove={removeCardFromDeck}
                quantity={cardCounts[card.name] || 0}
                viewMode={viewMode}
              />
            </ItemWrapper>
          ))}
        </ListGrid>
      </ScrollWrapper>

      {pagination && pagination.pages > 1 && (
        <Pagination>
          <PageBtn
            disabled={pagination.current === 1}
            onClick={() => setPage(pagination.current - 1)}
          >
            Previous
          </PageBtn>
          <PageInfo>
            Page {pagination.current} of {pagination.pages}
          </PageInfo>
          <PageBtn
            disabled={pagination.current === pagination.pages}
            onClick={() => setPage(pagination.current + 1)}
          >
            Next
          </PageBtn>
        </Pagination>
      )}
    </ListContainer>
  );
}

export default CardList;
