import React from "react";
import "./CardItem.css";

function CardItem({
  card,
  onRightClick,
  onAdd,
  onRemove,
  quantity,
  viewMode = "grid",
}) {
  const handleClick = (e) => {
    onAdd && onAdd(card);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    onRightClick(card);
  };

  if (viewMode === "list") {
    return (
      <div
        className="card list-item"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="list-item-main">
          <span className="list-item-name">{card.name}</span>
          <span className="list-item-type">{card.type}</span>
        </div>

        <div className="list-item-stats">
          {card.energy_cost !== null && (
            <span className="list-stat energy">{card.energy_cost}E</span>
          )}
          {card.power !== null && (
            <span className="list-stat power">{card.power}P</span>
          )}
          {card.might !== null && (
            <span className="list-stat might">{card.might}M</span>
          )}
        </div>

        <div className="list-item-controls">
          {quantity > 0 && (
            <div
              className={`list-qty-controls ${!onAdd && !onRemove ? "read-only" : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              {onRemove && (
                <button
                  className="list-ctrl-btn minus"
                  onClick={() => onRemove(card.id)}
                >
                  -
                </button>
              )}
              <span className="list-qty-val">x{quantity}</span>
              {onAdd && (
                <button
                  className="list-ctrl-btn plus"
                  onClick={() => onAdd(card)}
                >
                  +
                </button>
              )}
            </div>
          )}
          {quantity === 0 && onAdd && (
            <button className="list-add-btn" onClick={handleClick}>
              Add
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="card image-only"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title="Right-click for details"
    >
      {quantity > 0 && (
        <div
          className={`card-quick-controls ${!onAdd && !onRemove ? "read-only" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {onRemove && (
            <button
              className="quick-ctrl-btn minus"
              onClick={() => onRemove(card.id)}
              title="Remove one"
            >
              -
            </button>
          )}
          <span className="quick-ctrl-qty">x{quantity}</span>
          {onAdd && (
            <button
              className="quick-ctrl-btn plus"
              onClick={() => onAdd(card)}
              title="Add one"
            >
              +
            </button>
          )}
        </div>
      )}
      <div className="card-image-container">
        {card.image_url ? (
          <img src={card.image_url} alt={card.name} loading="lazy" />
        ) : (
          <div className="card-placeholder">
            <span>{card.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardItem;
