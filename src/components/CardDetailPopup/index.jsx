import React, { useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import tapIcon from "../../assets/icons/tap.webp";
import mightIcon from "../../assets/icons/might.webp";
import BodyIcon from "../../assets/domains/Body.webp";
import CalmIcon from "../../assets/domains/Calm.webp";
import ChaosIcon from "../../assets/domains/Chaos.webp";
import FuryIcon from "../../assets/domains/Fury.webp";
import MindIcon from "../../assets/domains/Mind.webp";
import OrderIcon from "../../assets/domains/Order.webp";

const popIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
  overscroll-behavior: contain;
  touch-action: none;
`;

const Popup = styled.div`
  background: #181818;
  width: 90%;
  max-width: 850px;
  max-height: 90vh;
  border-radius: 20px;
  display: flex;
  overflow: hidden;
  border: 1px solid #333;
  animation: ${popIn} 0.3s ease;
  position: relative;
  color: ${(props) => props.theme.colors.textMain};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

const PopupContent = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
`;

const PopupImage = styled.div`
  flex: 1;
  min-width: 300px;
  background: #121212;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }
`;

const PopupInfo = styled.div`
  flex: 1.2;
  min-width: 300px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  h2 {
    margin: 0;
    font-size: 2.2rem;
    color: white;
  }
`;

const PopupStats = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatBadge = styled.span`
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;

  ${(props) =>
    props.type === "type" &&
    css`
      background: #333;
      color: #eee;
    `}

  ${({ type, theme }) =>
    type === "energy" &&
    css`
      background: rgba(77, 171, 247, 0.15);
      color: ${theme.colors.primary};
    `}

  ${({ type }) =>
    type === "set" &&
    css`
      background: rgba(255, 192, 72, 0.15);
      color: #ffc048;
      border: 1px solid rgba(255, 192, 72, 0.3);
    `}
`;

const PopupTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: -10px;
`;

const TagPill = styled.span`
  background: rgba(255, 255, 255, 0.05);
  color: #aaa;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PopupText = styled.div`
  font-size: 1.05rem;
  line-height: 1.6;
  color: #ccc;
  background: rgba(255, 255, 255, 0.03);
  padding: 20px;
  border-radius: 12px;
  border-left: 4px solid #444;
  white-space: normal;
  text-align: left;
`;

const RichTextContent = styled.div`
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;

  p {
    margin: 0;
    margin-bottom: 12px;
    display: block;

    &:last-child {
      margin-bottom: 0;
    }
  }

  br {
    display: none;
  }

  img {
    width: 20px;
    height: 20px;
    margin: 0;
    margin-left: -2px;
    margin-top: -4px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  }

  em {
    color: #888;
    font-size: 0.9em;
  }

  .text-icon {
    width: 18px;
    height: 18px;
    vertical-align: middle;
    margin: 0 2px;
  }

  .rune-icon {
    background: rgba(0, 0, 0, 0.4);
    border-radius: 50%;
    padding: 1px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .energy-circle-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: #7f7f7f;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 800;
    vertical-align: middle;
    margin: 0 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    line-height: 1;
  }

  .rune-text-replacement {
    color: #7f7f7f;
    font-weight: 800;
  }
`;

const CombatStats = styled.div`
  display: flex;
  gap: 40px;
  background: #23080a;
  padding: 15px 30px;
  border-radius: 12px;
  border: 1px solid #4a1b1f;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  color: #ff8787;
  letter-spacing: 1px;
`;

const PopupActions = styled.div`
  display: flex;
  gap: 12px;
`;

const AddButton = styled.button`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;

  &:hover {
    background: #74c0fc;
    transform: translateY(-2px);
  }

  ${({ secondary, theme }) =>
    secondary &&
    css`
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid ${theme.colors.borderColor};
      color: ${theme.colors.textDim};

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-color: #666;
      }
    `}
`;

const domainIcons = {
  body: BodyIcon,
  calm: CalmIcon,
  chaos: ChaosIcon,
  fury: FuryIcon,
  mind: MindIcon,
  order: OrderIcon,
};

function CardDetailPopup({ card, onClose, onAdd }) {
  const showAddButtons = !!onAdd;

  useEffect(() => {
    if (!card) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = prevBodyOverflow || "";
      document.documentElement.style.overflow = prevHtmlOverflow || "";
      document.body.style.touchAction = prevTouchAction || "";
    };
  }, [card]);

  if (!card) return null;

  const renderCardText = () => {
    // Prioridad absoluta al Rich Text de la API (contiene HTML con iconos y saltos de línea)
    if (card.rich_text) {
      // 1. Reemplazamos los <br /> por saltos de línea reales para que pre-wrap los reconozca
      // 2. Limpiamos los tokens que la API no procesó (:rb_might:, :rb_energy_X:, etc.)
      const cleanRichText = card.rich_text
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(
          /:rb_exhaust:/g,
          `<img src="${tapIcon}" alt="Exhaust" class="text-icon" />`,
        )
        .replace(
          /:rb_might:/g,
          `<img src="${mightIcon}" alt="Might" class="text-icon" />`,
        )
        .replace(
          /:rb_energy_(\d+):/g,
          (match, val) => `<span class="energy-circle-icon">${val}</span>`,
        )
        .replace(/:rb_rune_(\w+):/g, (match, domain) => {
          if (domain === "rainbow")
            return `<strong class="rune-text-replacement">[Rune]</strong>`;
          const iconSrc = domainIcons[domain.toLowerCase()];
          return iconSrc
            ? `<img src="${iconSrc}" alt="${domain}" class="text-icon rune-icon" />`
            : `[${domain}]`;
        });

      return (
        <RichTextContent dangerouslySetInnerHTML={{ __html: cleanRichText }} />
      );
    }

    // Fallback al texto plano procesado si no hay rich_text
    const textToProcess = card.plain_text || card.text;
    if (!textToProcess) return null;

    // Lógica de procesamiento manual de iconos (solo como respaldo)
    const parts = textToProcess.split(
      /(:rb_exhaust:|:rb_might:|:rb_energy_\d+:|:rb_rune_\w+:)/g,
    );

    return (
      <RichTextContent>
        <p>
          {parts.map((part, index) => {
            if (part === ":rb_exhaust:") {
              return (
                <img
                  key={index}
                  src={tapIcon}
                  alt="Exhaust"
                  className="text-icon"
                />
              );
            }
            if (part === ":rb_might:") {
              return (
                <img
                  key={index}
                  src={mightIcon}
                  alt="Might"
                  className="text-icon"
                />
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
              if (domain === "rainbow")
                return (
                  <strong key={index} className="rune-text-replacement">
                    [Rune]
                  </strong>
                );
              const iconSrc = domainIcons[domain];
              if (iconSrc)
                return (
                  <img
                    key={index}
                    src={iconSrc}
                    alt={domain}
                    className="text-icon rune-icon"
                  />
                );
            }
            return part;
          })}
        </p>
      </RichTextContent>
    );
  };

  return (
    <Overlay onClick={onClose}>
      <Popup onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>

        <PopupContent>
          <PopupImage>
            {card.image_url && <img src={card.image_url} alt={card.name} />}
          </PopupImage>

          <PopupInfo>
            <h2>{card.name}</h2>

            <PopupStats>
              <StatBadge type="type">{card.type}</StatBadge>
              {card.label && <StatBadge type="set">{card.label}</StatBadge>}
              {card.energy !== undefined && card.energy > 0 && (
                <StatBadge type="energy">Energy: {card.energy}</StatBadge>
              )}
            </PopupStats>

            {card.tags && (
              <PopupTags>
                {card.tags.split(", ").map((tag, index) => (
                  <TagPill key={index}>{tag}</TagPill>
                ))}
              </PopupTags>
            )}

            <PopupText>{renderCardText()}</PopupText>

            {card.type === "Creature" &&
              (card.power !== undefined || card.might !== undefined) && (
                <CombatStats>
                  {card.power !== undefined && <span>PWR: {card.power}</span>}
                  {card.might !== undefined && <span>MGT: {card.might}</span>}
                </CombatStats>
              )}

            {showAddButtons && (
              <PopupActions>
                <AddButton
                  onClick={() => {
                    onAdd(card, false);
                    onClose();
                  }}
                >
                  Add to Main Deck
                </AddButton>
                {card.type !== "Legend" && card.type !== "Battlefield" && (
                  <AddButton
                    secondary
                    onClick={() => {
                      onAdd(card, true);
                      onClose();
                    }}
                  >
                    Add to Sideboard
                  </AddButton>
                )}
              </PopupActions>
            )}
          </PopupInfo>
        </PopupContent>
      </Popup>
    </Overlay>
  );
}

export default CardDetailPopup;
