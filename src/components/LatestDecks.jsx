import React from "react";
import "./LatestDecks.css";

const LatestDecks = ({ decks, isLoading, onSelectDeck, title }) => {
  if (isLoading) {
    return (
      <div className="latest-decks-section">
        {title && <h2 className="section-title">{title}</h2>}
        <div className="latest-decks-loading">
          <div className="spinner"></div>
          <p>Summoning decks...</p>
        </div>
      </div>
    );
  }

  if (!decks || decks.length === 0) {
    return (
      <div className="latest-decks-section">
        {title && <h2 className="section-title">{title}</h2>}
        <div className="latest-decks-empty">
          <p>No decks found. Time to forge your first one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="latest-decks-section">
      {title && <h2 className="section-title">{title}</h2>}
      <div className="latest-decks-grid">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="deck-card-v2"
            onClick={() => onSelectDeck(deck.id)}
          >
            <div className="deck-card-image">
              <img
                src={
                  deck.legend_image ||
                  `https://api.riftcodex.com/media/cards/images/1.webp`
                }
                alt={deck.name}
                onError={(e) => {
                  e.target.src =
                    "https://api.riftcodex.com/media/cards/images/1.webp";
                }}
              />
              <div className="image-overlay"></div>
            </div>
            <div className="deck-card-content">
              <div className="deck-info">
                <h3>{deck.name}</h3>
                <p>{deck.description || "No description provided."}</p>
              </div>
              <div className="deck-footer">
                <span className="deck-date">
                  {new Date(deck.updated_at || Date.now()).toLocaleDateString()}
                </span>
                <button className="view-btn">View Deck</button>
              </div>
            </div>
            <div className="card-glow"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestDecks;
