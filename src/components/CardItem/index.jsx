import React from "react";
import styled from "styled-components";

const CardWrapper = styled.div`
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadows.main};
  transition: ${props => props.theme.effects.transition};
  position: relative;
  width: 100%;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
    z-index: 10;
    border-color: #555;
  }
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 20px;
  gap: 20px;
  transition: ${props => props.theme.effects.transition};
  cursor: pointer;
  width: 100%;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: ${props => props.theme.colors.primary};
    transform: translateX(4px);
  }
`;

const ListItemMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ListItemName = styled.span`
  font-weight: 700;
  font-size: 1.05rem;
  color: white;
`;

const ListItemType = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textDim};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ListItemStats = styled.div`
  display: flex;
  gap: 8px;
`;

const ListStat = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 800;
  min-width: 32px;
  text-align: center;
  border: 1px solid transparent;

  &.energy {
    background: rgba(52, 152, 219, 0.2);
    color: #3498db;
    border-color: rgba(52, 152, 219, 0.3);
  }
  &.power {
    background: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
    border-color: rgba(231, 76, 60, 0.3);
  }
  &.might {
    background: rgba(46, 204, 113, 0.2);
    color: #2ecc71;
    border-color: rgba(46, 204, 113, 0.3);
  }
`;

const ListItemControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const QtyControls = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 2px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &.read-only {
    background: rgba(77, 171, 247, 0.1);
    border-color: rgba(77, 171, 247, 0.2);
    padding: 4px 12px;
    
    span {
      color: ${props => props.theme.colors.primary};
    }
  }
`;

const CtrlBtn = styled.button`
  background: transparent;
  border: none;
  color: white;
  width: 26px;
  height: 26px;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const QuickControls = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: #2b2b2b78;
  backdrop-filter: blur(8px);
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 2px;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  transition: ${props => props.theme.effects.transition};

  &:hover {
    border-color: ${props => props.theme.colors.primaryGlow};
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7);
  }

  &.read-only {
    span {
      color: #fff;
      font-size: 0.85rem;
    }
  }
`;

const QtyVal = styled.span`
  min-width: 24px;
  text-align: center;
  font-weight: 800;
  font-size: 0.9rem;
  color: #fff;
  letter-spacing: -0.02em;
`;

const ImageContainer = styled.div`
  width: 100%;
  position: relative;
  cursor: pointer;

  img {
    width: 100%;
    object-fit: contain;
    display: block;
  }
`;

const Placeholder = styled.div`
  width: 100%;
  aspect-ratio: 2/3;
  background: ${props => props.theme.colors.bgAccent};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  color: ${props => props.theme.colors.textDim};
  font-weight: bold;
`;

const ListAddBtn = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

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
      <ListItem onClick={handleClick} onContextMenu={handleContextMenu}>
        <ListItemMain>
          <ListItemName>{card.name}</ListItemName>
          <ListItemType>{card.type}</ListItemType>
        </ListItemMain>

        <ListItemStats>
          {card.energy_cost !== null && (
            <ListStat className="energy">{card.energy_cost}E</ListStat>
          )}
          {card.power !== null && (
            <ListStat className="power">{card.power}P</ListStat>
          )}
          {card.might !== null && (
            <ListStat className="might">{card.might}M</ListStat>
          )}
        </ListItemStats>

        <ListItemControls>
          {quantity > 0 && (
            <QtyControls
              className={!onAdd && !onRemove ? "read-only" : ""}
              onClick={(e) => e.stopPropagation()}
            >
              {onRemove && (
                <CtrlBtn onClick={() => onRemove(card.id)}>-</CtrlBtn>
              )}
              <QtyVal>x{quantity}</QtyVal>
              {onAdd && (
                <CtrlBtn onClick={() => onAdd(card)}>+</CtrlBtn>
              )}
            </QtyControls>
          )}
          {quantity === 0 && onAdd && (
            <ListAddBtn onClick={handleClick}>Add</ListAddBtn>
          )}
        </ListItemControls>
      </ListItem>
    );
  }

  return (
    <CardWrapper
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title="Right-click for details"
    >
      {quantity > 0 && (
        <QuickControls
          className={!onAdd && !onRemove ? "read-only" : ""}
          onClick={(e) => e.stopPropagation()}
        >
          {onRemove && (
            <CtrlBtn onClick={() => onRemove(card.id)} title="Remove one">
              -
            </CtrlBtn>
          )}
          <QtyVal>x{quantity}</QtyVal>
          {onAdd && (
            <CtrlBtn onClick={() => onAdd(card)} title="Add one">
              +
            </CtrlBtn>
          )}
        </QuickControls>
      )}
      <ImageContainer>
        {card.image_url ? (
          <img src={card.image_url} alt={card.name} loading="lazy" />
        ) : (
          <Placeholder>
            <span>{card.name}</span>
          </Placeholder>
        )}
      </ImageContainer>
    </CardWrapper>
  );
}

export default CardItem;
