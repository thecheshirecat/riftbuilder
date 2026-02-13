import React from "react";
import { Link } from "react-router-dom";
import "./LatestDecks.css";

const LatestDecks = ({
  decks,
  isLoading,
  onSelectDeck,
  title,
  showSeeMore,
}) => {
  // -- Estados de Carga y Vacío --
  if (isLoading) {
    return (
      <div className="latest-decks-section">
        <div className="section-header">
          {title && <h2 className="section-title">{title}</h2>}
        </div>
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
        <div className="section-header">
          {title && <h2 className="section-title">{title}</h2>}
        </div>
        <div className="latest-decks-empty">
          <p>No decks found. Time to forge your first one!</p>
        </div>
      </div>
    );
  }

  // -- Renderizado de la Cuadrícula de Mazos --
  return (
    <div className="latest-decks-section">
      <div className="section-header">
        {title && <h2 className="section-title">{title}</h2>}
        {showSeeMore && (
          <Link to="/decks" className="see-more-link">
            See More →
          </Link>
        )}
      </div>
      <div className="latest-decks-grid">
        {decks.map((deck) => (
          <div
            key={deck.id}
            className="deck-card-v2"
            onClick={() => onSelectDeck(deck.id)}
          >
            {/* Imagen del mazo (usando la imagen de la Leyenda o una por defecto) */}
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

            {/* Información del mazo */}
            <div className="deck-card-content">
              <div className="deck-info">
                <h3>{deck.name}</h3>
                <p>{deck.description || "No description provided."}</p>
              </div>

              {/* Pie de la tarjeta con nombre de usuario y botón de acción */}
              <div className="deck-footer">
                <span className="deck-author">
                  @{deck.username || "Anonymous"}
                </span>
                <button className="view-btn">View Deck</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestDecks;
