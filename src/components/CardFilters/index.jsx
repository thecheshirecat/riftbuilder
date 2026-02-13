import React from "react";
import styled, { keyframes, css } from "styled-components";
import { safeParse } from "../../utils/cardUtils";
import BodyIcon from "../../assets/domains/Body.webp";
import CalmIcon from "../../assets/domains/Calm.webp";
import ChaosIcon from "../../assets/domains/Chaos.webp";
import FuryIcon from "../../assets/domains/Fury.webp";
import MindIcon from "../../assets/domains/Mind.webp";
import OrderIcon from "../../assets/domains/Order.webp";
import CommonIcon from "../../assets/rarity/common.webp";
import UncommonIcon from "../../assets/rarity/uncommon.webp";
import RareIcon from "../../assets/rarity/rare.webp";
import EpicIcon from "../../assets/rarity/epic.webp";
import ShowcaseIcon from "../../assets/rarity/showcase.webp";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const SearchControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #121212;
  backdrop-filter: blur(10px);
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: sticky;
  z-index: 11;
  top: 70px;
`;

const SearchMainRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 14px;
  opacity: 0.5;
  font-size: 1.1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    background: rgba(255, 255, 255, 0.1);
    border-color: ${(props) => props.theme.colors.primary};
    outline: none;
    box-shadow: 0 0 15px ${(props) => props.theme.colors.primaryGlow};
  }
`;

const ClearSearch = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 5px;
  font-size: 0.9rem;

  &:hover {
    color: white;
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const CustomSelectContainer = styled.div`
  position: relative;
  min-width: 180px;
  z-index: 100;
`;

const CustomSelectTrigger = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  ${(props) =>
    props.isOpen &&
    css`
      border-color: ${props.theme.colors.primary};
      background: rgba(255, 255, 255, 0.12);
      box-shadow: 0 0 10px ${props.theme.colors.primaryGlow};
    `}
`;

const SelectArrow = styled.span`
  font-size: 0.7rem;
  opacity: 0.6;
  margin-left: 10px;
  transition: transform 0.2s ease;
  transform: ${(props) => (props.isOpen ? "rotate(180deg)" : "none")};
`;

const CustomOptions = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(30, 30, 45, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  animation: ${fadeIn} 0.2s ease-out;
`;

const CustomOption = styled.div`
  padding: 12px 16px;
  color: ${(props) =>
    props.selected ? props.theme.colors.primary : "rgba(255, 255, 255, 0.8)"};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  background: ${(props) =>
    props.selected ? "rgba(0, 212, 255, 0.2)" : "transparent"};
  font-weight: ${(props) => (props.selected ? "600" : "500")};

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    padding-left: 20px;
  }
`;

const ActionButton = styled.button`
  padding: 10px 16px;
  background: ${(props) =>
    props.active ? props.theme.colors.primary : "rgba(255, 255, 255, 0.05)"};
  border: 1px solid
    ${(props) =>
      props.active ? props.theme.colors.primary : "rgba(255, 255, 255, 0.1)"};
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  box-shadow: ${(props) =>
    props.active ? `0 0 10px ${props.theme.colors.primaryGlow}` : "none"};

  &:hover {
    background: ${(props) =>
      props.active ? props.theme.colors.primary : "rgba(255, 255, 255, 0.15)"};
    border-color: ${(props) =>
      props.active ? props.theme.colors.primary : "rgba(255, 255, 255, 0.3)"};
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionLabel = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.5);
`;

const SectionHint = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
`;

const DomainIconContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const DomainIconWrapper = styled.div`
  width: 44px;
  height: 44px;
  padding: 8px;
  background: ${(props) =>
    props.selected ? "rgba(0, 212, 255, 0.15)" : "rgba(255, 255, 255, 0.03)"};
  border: 1px solid
    ${(props) =>
      props.selected
        ? props.theme.colors.primary
        : "rgba(255, 255, 255, 0.08)"};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${(props) =>
    props.selected ? "0 0 15px rgba(0, 212, 255, 0.2)" : "none"};
  opacity: ${(props) => (props.disabled ? "0.3" : "1")};
  pointer-events: ${(props) => (props.disabled ? "none" : "auto")};

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: ${(props) =>
      props.selected ? "grayscale(0) opacity(1)" : "grayscale(1) opacity(0.5)"};
    transition: all 0.3s ease;
  }
`;

const DomainFallbackText = styled.span`
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  color: white;
  text-align: center;
`;

const AdvancedFiltersPanel = styled.div`
  max-height: ${(props) => (props.expanded ? "500px" : "0")};
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(props) => (props.expanded ? "1" : "0")};
  border-top: ${(props) =>
    props.expanded
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "0 solid rgba(255, 255, 255, 0.1)"};
  padding-top: ${(props) => (props.expanded ? "20px" : "0")};
`;

const AdvancedGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(250px, 1fr) 2fr;
  gap: 40px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const SlidersColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StatRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }
`;

const DualRangeContainer = styled.div`
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  margin: 10px 0;
`;

const SliderProgress = styled.div`
  position: absolute;
  height: 100%;
  background: ${(props) => props.theme.colors.primary};
  border-radius: 3px;
  box-shadow: 0 0 10px ${(props) => props.theme.colors.primaryGlow};
`;

const RangeInput = styled.input`
  position: absolute;
  width: 100%;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  pointer-events: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  margin: 0;

  &::-webkit-slider-thumb {
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    pointer-events: auto;
    -webkit-appearance: none;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
    border: 2px solid ${(props) => props.theme.colors.primary};
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;

    &:hover {
      transform: scale(1.15);
      box-shadow: 0 0 12px ${(props) => props.theme.colors.primaryGlow};
    }
  }

  &::-moz-range-thumb {
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
    border: 2px solid ${(props) => props.theme.colors.primary};
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease;

    &:hover {
      transform: scale(1.15);
      box-shadow: 0 0 12px ${(props) => props.theme.colors.primaryGlow};
    }
  }

  &::-webkit-slider-runnable-track {
    background: none;
    border: none;
  }

  &::-moz-range-track {
    background: none;
    border: none;
  }
`;

const ChipsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

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

const domainIcons = {
  Body: BodyIcon,
  Calm: CalmIcon,
  Chaos: ChaosIcon,
  Fury: FuryIcon,
  Mind: MindIcon,
  Order: OrderIcon,
};

const rarityIcons = {
  Common: CommonIcon,
  Uncommon: UncommonIcon,
  Rare: RareIcon,
  Epic: EpicIcon,
  Showcase: ShowcaseIcon,
};

function CardFilters({
  filters,
  setFilters,
  availableDomains,
  disableTypeFilter,
  viewMode,
  setViewMode,
}) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [lastMoved, setLastMoved] = React.useState({}); // Track last moved handle per stat
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const sortRef = React.useRef(null);

  // Close custom select when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortOptions = [
    { value: "name", label: "Sort by Name" },
    { value: "energy", label: "Sort by Energy" },
    { value: "power", label: "Sort by Power" },
    { value: "might", label: "Sort by Might" },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === filters.sort)?.label ||
    "Sort by Name";

  // Filter out 'Colorless' as requested
  const filteredDomains = (availableDomains || []).filter(
    (d) => d !== "Colorless",
  );

  const handleStatChange = (name, value, isMin, maxLimit) => {
    const val = safeParse(value, 0);
    const baseName = name.split("_")[0];

    setFilters((prev) => {
      const newState = { ...prev, page: 1 };

      if (isMin) {
        const currentMax = safeParse(prev[`${baseName}_max`], maxLimit);
        newState[name] = Math.min(val, currentMax);
      } else {
        const currentMin = safeParse(prev[`${baseName}_min`], 0);
        newState[name] = Math.max(val, currentMin);
      }
      return newState;
    });

    setLastMoved((prev) => ({ ...prev, [baseName]: isMin ? "min" : "max" }));
  };

  const renderDualSlider = (label, minProp, maxProp, limit) => {
    const baseName = minProp.split("_")[0];
    const minVal = safeParse(filters[minProp], 0);
    const maxVal = safeParse(filters[maxProp], limit);
    const moved = lastMoved[baseName] || "min";

    // Dynamic z-index to handle overlap at boundaries
    const zIndexMin = moved === "min" || minVal === limit ? 11 : 10;
    const zIndexMax = moved === "max" || maxVal === 0 ? 11 : 10;

    return (
      <StatRow>
        <label>
          {label}: {minVal} - {maxVal}
        </label>
        <DualRangeContainer>
          <SliderProgress
            style={{
              left: `${(minVal / limit) * 100}%`,
              right: `${100 - (maxVal / limit) * 100}%`,
            }}
          />
          <RangeInput
            type="range"
            min="0"
            max={limit}
            step="1"
            value={minVal}
            style={{ zIndex: zIndexMin }}
            onChange={(e) =>
              handleStatChange(minProp, e.target.value, true, limit)
            }
          />
          <RangeInput
            type="range"
            min="0"
            max={limit}
            step="1"
            value={maxVal}
            style={{ zIndex: zIndexMax }}
            onChange={(e) =>
              handleStatChange(maxProp, e.target.value, false, limit)
            }
          />
        </DualRangeContainer>
      </StatRow>
    );
  };

  return (
    <SearchControls>
      <SearchMainRow>
        <SearchInputWrapper>
          <SearchIcon>🔍</SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search cards..."
            value={filters.q}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, q: e.target.value, page: 1 }))
            }
          />
          {filters.q && (
            <ClearSearch
              onClick={() => setFilters((p) => ({ ...p, q: "", page: 1 }))}
            >
              ✕
            </ClearSearch>
          )}
        </SearchInputWrapper>

        <FilterActions>
          <CustomSelectContainer ref={sortRef}>
            <CustomSelectTrigger
              isOpen={isSortOpen}
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              <span>{currentSortLabel}</span>
              <SelectArrow isOpen={isSortOpen}>▼</SelectArrow>
            </CustomSelectTrigger>
            {isSortOpen && (
              <CustomOptions>
                {sortOptions.map((opt) => (
                  <CustomOption
                    key={opt.value}
                    selected={filters.sort === opt.value}
                    onClick={() => {
                      setFilters((p) => ({ ...p, sort: opt.value, page: 1 }));
                      setIsSortOpen(false);
                    }}
                  >
                    {opt.label}
                  </CustomOption>
                ))}
              </CustomOptions>
            )}
          </CustomSelectContainer>

          <ActionButton
            onClick={() =>
              setFilters((p) => ({
                ...p,
                order: p.order === "ASC" ? "DESC" : "ASC",
                page: 1,
              }))
            }
            title={filters.order === "ASC" ? "Ascending" : "Descending"}
          >
            {filters.order === "ASC" ? "↑" : "↓"}
          </ActionButton>

          <ActionButton
            active={showAdvanced}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Simple" : "Advanced"}
          </ActionButton>
        </FilterActions>
      </SearchMainRow>

      <FilterSection>
        <SectionHeader>
          <SectionLabel>Domains</SectionLabel>
          <SectionHint>Max 2</SectionHint>
        </SectionHeader>
        <DomainIconContainer>
          {filteredDomains.map((d) => {
            const isSelected = filters.domains.includes(d);
            const iconSrc = domainIcons[d];

            return (
              <DomainIconWrapper
                key={d}
                selected={isSelected}
                disabled={!isSelected && filters.domains.length >= 2}
                onClick={() => {
                  setFilters((prev) => {
                    let newDomains = [...prev.domains];
                    if (isSelected) {
                      newDomains = newDomains.filter((domain) => domain !== d);
                    } else {
                      if (newDomains.length < 2) newDomains.push(d);
                    }
                    return { ...prev, domains: newDomains, page: 1 };
                  });
                }}
                title={d}
              >
                {iconSrc ? (
                  <img src={iconSrc} alt={d} />
                ) : (
                  <DomainFallbackText>{d}</DomainFallbackText>
                )}
              </DomainIconWrapper>
            );
          })}
        </DomainIconContainer>
      </FilterSection>

      <AdvancedFiltersPanel expanded={showAdvanced}>
        <AdvancedGrid>
          <SlidersColumn>
            {renderDualSlider("Energy", "energy_min", "energy_max", 12)}
            {renderDualSlider("Power", "power_min", "power_max", 4)}
            {renderDualSlider("Might", "might_min", "might_max", 12)}
          </SlidersColumn>

          <ChipsColumn>
            {!disableTypeFilter && (
              <>
                <ChipGroup>
                  <label>Card Types</label>
                  <ChipContainer>
                    {[
                      "Unit",
                      "Spell",
                      "Gear",
                      "Champion",
                      "Rune",
                      "Battlefield",
                      "Legend",
                    ].map((type) => {
                      const activeTypes = Array.isArray(filters.type)
                        ? filters.type
                        : filters.type
                          ? filters.type.split(",").filter(Boolean)
                          : [];

                      const isSelected = activeTypes.includes(type);

                      const isSpecialType = [
                        "Rune",
                        "Battlefield",
                        "Legend",
                      ].includes(type);

                      const activeSection = filters.activeSection;
                      let isDisabled = false;

                      if (activeSection === "legend") {
                        isDisabled = type !== "Legend";
                      } else if (activeSection === "battlefield") {
                        isDisabled = type !== "Battlefield";
                      } else if (activeSection === "runes") {
                        isDisabled = type !== "Rune";
                      } else if (activeSection === "main") {
                        isDisabled = ![
                          "Unit",
                          "Spell",
                          "Gear",
                          "Champion",
                        ].includes(type);
                      } else if (activeSection === "sideboard") {
                        isDisabled = ["Battlefield", "Legend"].includes(type);
                      } else {
                        const hasSpecialSelected = activeTypes.some((t) =>
                          ["Rune", "Battlefield", "Legend"].includes(t),
                        );
                        const hasMainDeckSelected = activeTypes.some((t) =>
                          ["Unit", "Spell", "Gear", "Champion"].includes(t),
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
                          onClick={() => {
                            if (isDisabled) return;
                            setFilters((prev) => {
                              let newTypes = Array.isArray(prev.type)
                                ? [...prev.type]
                                : prev.type
                                  ? prev.type.split(",").filter(Boolean)
                                  : [];

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
                          }}
                        >
                          {type}
                        </TypeChip>
                      );
                    })}
                  </ChipContainer>
                </ChipGroup>

                <ChipGroup>
                  <label>Rarity</label>
                  <ChipContainer>
                    {["Common", "Uncommon", "Rare", "Epic", "Showcase"].map(
                      (rarity) => {
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
                            onClick={() => {
                              setFilters((prev) => {
                                let newRarities = Array.isArray(prev.rarity)
                                  ? [...prev.rarity]
                                  : prev.rarity
                                    ? prev.rarity.split(",").filter(Boolean)
                                    : [];
                                if (isSelected)
                                  newRarities = newRarities.filter(
                                    (r) => r !== rarity,
                                  );
                                else newRarities.push(rarity);
                                return {
                                  ...prev,
                                  rarity: newRarities.join(","),
                                  page: 1,
                                };
                              });
                            }}
                          >
                            <RarityMiniIcon
                              src={rarityIcons[rarity]}
                              alt={rarity}
                            />
                            {rarity}
                          </TypeChip>
                        );
                      },
                    )}
                  </ChipContainer>
                </ChipGroup>
              </>
            )}
          </ChipsColumn>
        </AdvancedGrid>
      </AdvancedFiltersPanel>
    </SearchControls>
  );
}

export default CardFilters;
