import React from "react";
import styled from "styled-components";

const ChipGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255, 255, 255, 0.4);
  }
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TypeChip = styled.div`
  padding: 8px 16px;
  background: ${(props) =>
    props.selected ? props.theme.colors.primary : "rgba(255, 255, 255, 0.05)"};
  border: 1px solid
    ${(props) =>
      props.selected ? props.theme.colors.primary : "rgba(255, 255, 255, 0.1)"};
  border-radius: 12px;
  font-size: 0.85rem;
  color: ${(props) => (props.selected ? "white" : "rgba(255, 255, 255, 0.7)")};
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: ${(props) =>
    props.selected ? `0 0 15px ${props.theme.colors.primaryGlow}` : "none"};
  opacity: ${(props) => (props.disabled ? "0.2" : "1")};
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};
  filter: ${(props) => (props.disabled ? "grayscale(1)" : "none")};

  &:hover {
    background: ${(props) =>
      props.selected ? props.theme.colors.primary : "rgba(255, 255, 255, 0.1)"};
    border-color: ${(props) =>
      props.selected ? props.theme.colors.primary : "rgba(255, 255, 255, 0.2)"};
  }
`;

const RarityMiniIcon = styled.img`
  width: 16px;
  height: 16px;
  object-fit: contain;
`;

export const CardTypeFilters = ({ filters, setFilters }) => {
  const cardTypes = [
    "Unit",
    "Spell",
    "Gear",
    "Champion",
    "Rune",
    "Battlefield",
    "Legend",
  ];

  const toggleType = (type, isSpecialType) => {
    setFilters((prev) => {
      let newTypes = Array.isArray(prev.type)
        ? [...prev.type]
        : prev.type
          ? prev.type.split(",").filter(Boolean)
          : [];

      const isSelected = newTypes.includes(type);

      if (isSelected) {
        newTypes = newTypes.filter((t) => t !== type);
      } else {
        if (isSpecialType) {
          newTypes = [type];
        } else {
          newTypes.push(type);
        }
      }

      return {
        ...prev,
        type: newTypes.join(","),
        page: 1,
      };
    });
  };

  return (
    <ChipGroup>
      <label>Card Types</label>
      <ChipContainer>
        {cardTypes.map((type) => {
          const activeTypes = Array.isArray(filters.type)
            ? filters.type
            : filters.type
              ? filters.type.split(",").filter(Boolean)
              : [];

          const isSelected = activeTypes.includes(type);
          const isSpecialType = ["Rune", "Battlefield", "Legend"].includes(type);
          const activeSection = filters.activeSection;
          let isDisabled = false;

          if (activeSection === "legend") {
            isDisabled = type !== "Legend";
          } else if (activeSection === "battlefield") {
            isDisabled = type !== "Battlefield";
          } else if (activeSection === "runes") {
            isDisabled = type !== "Rune";
          } else if (activeSection === "main") {
            isDisabled = !["Unit", "Spell", "Gear", "Champion"].includes(type);
          } else if (activeSection === "sideboard") {
            isDisabled = ["Battlefield", "Legend"].includes(type);
          } else {
            const hasSpecialSelected = activeTypes.some((t) =>
              ["Rune", "Battlefield", "Legend"].includes(t)
            );
            const hasMainDeckSelected = activeTypes.some((t) =>
              ["Unit", "Spell", "Gear", "Champion"].includes(t)
            );

            if (hasSpecialSelected) {
              isDisabled = !isSelected;
            } else if (hasMainDeckSelected) {
              isDisabled = isSpecialType;
            }
          }

          return (
            <TypeChip
              key={type}
              selected={isSelected}
              disabled={isDisabled}
              onClick={() => !isDisabled && toggleType(type, isSpecialType)}
            >
              {type}
            </TypeChip>
          );
        })}
      </ChipContainer>
    </ChipGroup>
  );
};

export const RarityFilters = ({ filters, setFilters, rarityIcons }) => {
  const rarities = ["Common", "Uncommon", "Rare", "Epic", "Showcase"];

  const toggleRarity = (rarity) => {
    setFilters((prev) => {
      let newRarities = Array.isArray(prev.rarity)
        ? [...prev.rarity]
        : prev.rarity
          ? prev.rarity.split(",").filter(Boolean)
          : [];

      const isSelected = newRarities.includes(rarity);

      if (isSelected) {
        newRarities = newRarities.filter((r) => r !== rarity);
      } else {
        newRarities.push(rarity);
      }

      return {
        ...prev,
        rarity: newRarities.join(","),
        page: 1,
      };
    });
  };

  return (
    <ChipGroup>
      <label>Rarity</label>
      <ChipContainer>
        {rarities.map((rarity) => {
          const activeRarities = Array.isArray(filters.rarity)
            ? filters.rarity
            : filters.rarity
              ? filters.rarity.split(",").filter(Boolean)
              : [];
          const isSelected = activeRarities.includes(rarity);

          return (
            <TypeChip
              key={rarity}
              selected={isSelected}
              onClick={() => toggleRarity(rarity)}
            >
              <RarityMiniIcon src={rarityIcons[rarity]} alt={rarity} />
              {rarity}
            </TypeChip>
          );
        })}
      </ChipContainer>
    </ChipGroup>
  );
};
