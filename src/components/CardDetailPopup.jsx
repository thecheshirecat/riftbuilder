import React from "react";
import tapIcon from "../assets/icons/tap.webp";
import mightIcon from "../assets/icons/might.webp";
import BodyIcon from "../assets/domains/Body.webp";
import CalmIcon from "../assets/domains/Calm.webp";
import ChaosIcon from "../assets/domains/Chaos.webp";
import FuryIcon from "../assets/domains/Fury.webp";
import MindIcon from "../assets/domains/Mind.webp";
import OrderIcon from "../assets/domains/Order.webp";
import "./CardDetailPopup.css";

const domainIcons = {
  body: BodyIcon,
  calm: CalmIcon,
  chaos: ChaosIcon,
  fury: FuryIcon,
  mind: MindIcon,
  order: OrderIcon,
};

function CardDetailPopup({ card, onClose, onAdd }) {
  if (!card) return null;

  const showAddButtons = !!onAdd;

  const renderTextWithIcons = (text) => {
    if (!text) return null;

    // Split by tokens including :rb_energy_X: and :rb_rune_DOMAIN:
    const parts = text.split(
      /(:rb_exhaust:|:rb_might:|:rb_energy_\d+:|:rb_rune_\w+:)/g,
    );

    return parts.map((part, index) => {
      if (part === ":rb_exhaust:") {
        return (
          <img key={index} src={tapIcon} alt="Exhaust" className="text-icon" />
        );
      }
      if (part === ":rb_might:") {
        return (
          <img key={index} src={mightIcon} alt="Might" className="text-icon" />
        );
      }
      if (part.startsWith(":rb_energy_")) {
        const energyValue = part.match(/\d+/)[0];
        return (
          <span key={index} className="energy-circle-icon">
            {energyValue}
          </span>
        );
      }
      if (part.startsWith(":rb_rune_")) {
        const domain = part
          .replace(":rb_rune_", "")
          .replace(":", "")
          .toLowerCase();

        if (domain === "rainbow") {
          return (
            <strong key={index} className="rune-text-replacement">
              [Rune]
            </strong>
          );
        }

        const iconSrc = domainIcons[domain];
        if (iconSrc) {
          return (
            <img
              key={index}
              src={iconSrc}
              alt={domain}
              className="text-icon rune-icon"
            />
          );
        }
      }
      return part;
    });
  };

  return (
    <div className="card-detail-overlay" onClick={onClose}>
      <div className="card-detail-popup" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <div className="popup-content">
          <div className="popup-image">
            {card.image_url && <img src={card.image_url} alt={card.name} />}
          </div>

          <div className="popup-info">
            <h2>{card.name}</h2>

            <div className="popup-stats">
              <span className="stat-badge type">{card.type}</span>
              {card.energy !== undefined && (
                <span className="stat-badge energy">Energy: {card.energy}</span>
              )}
            </div>

            {card.plain_text && (
              <div className="popup-text">
                <p>{renderTextWithIcons(card.plain_text)}</p>
              </div>
            )}

            {card.type === "Creature" &&
              (card.power !== undefined || card.might !== undefined) && (
                <div className="popup-combat-stats">
                  {card.power !== undefined && <span>PWR: {card.power}</span>}
                  {card.might !== undefined && <span>MGT: {card.might}</span>}
                </div>
              )}

            {showAddButtons && (
              <div className="popup-actions">
                <button
                  className="add-button"
                  onClick={() => {
                    onAdd(card, false);
                    onClose();
                  }}
                >
                  Add to Main Deck
                </button>
                {card.type !== "Legend" && card.type !== "Battlefield" && (
                  <button
                    className="add-button secondary"
                    onClick={() => {
                      onAdd(card, true);
                      onClose();
                    }}
                  >
                    Add to Sideboard
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardDetailPopup;
