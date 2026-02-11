import React from "react";
import CardItem from "./CardItem";
import "./CardList.css";

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
      <div className="loading">No cards found matching your criteria.</div>
    );
  }

  return (
    <div className={`card-list-container ${viewMode}-view`}>
      <div className="card-list-scroll-wrapper custom-scrollbar">
        <div className={`card-list user-select-none ${viewMode}-mode`}>
          {cards.map((card, index) => (
            <div
              key={card.id || `${card.name}-${index}`}
              className="card-item-wrapper"
            >
              <CardItem
                card={card}
                onRightClick={setSelectedCard}
                onAdd={addCardToDeck}
                onRemove={removeCardFromDeck}
                quantity={cardCounts[card.name] || 0}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.current === 1}
            onClick={() => setPage(pagination.current - 1)}
          >
            Previous
          </button>
          <span className="page-info">
            Page {pagination.current} of {pagination.pages}
          </span>
          <button
            disabled={pagination.current === pagination.pages}
            onClick={() => setPage(pagination.current + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default CardList;
