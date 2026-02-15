import React from "react";
import styled, { keyframes, css } from "styled-components";
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

// Componentes extraídos
import SearchBar from "./SearchBar";
import DomainFilters from "./DomainFilters";
import StatSliders from "./StatSliders";
import { CardTypeFilters, RarityFilters } from "./ChipFilters";

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
  z-index: 1000;
  top: 70px;
  left: 0;
  right: 0;
  width: 100%;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    padding: 14px;
    gap: 12px;
    margin-bottom: 16px;
  }
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: 10px;
    gap: 10px;
    margin-bottom: 0;
    border-radius: 12px;
    border: 0;
  }
`;

const SearchMainRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;
const MobileToggleRow = styled.div`
  display: none;
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }
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

const AdvancedFiltersPanel = styled.div`
  display: grid;
  grid-template-rows: ${(props) => (props.expanded ? "1fr" : "0fr")};
  transition: grid-template-rows 300ms ease;
  & > * {
    overflow: hidden;
  }
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

const ChipsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  isMobile,
  mobileColumnView,
  setMobileColumnView,
}) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
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

  return (
    <SearchControls>
      {!(isMobile && mobileColumnView === "right") && (
        <SearchMainRow>
          <SearchBar query={filters.q} setFilters={setFilters} />

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
      )}

      <MobileToggleRow>
        <ActionButton
          type="button"
          active={mobileColumnView === "left"}
          onClick={() => setMobileColumnView("left")}
          title="Cards"
        >
          C
        </ActionButton>
        <ActionButton
          type="button"
          active={mobileColumnView === "right"}
          onClick={() => setMobileColumnView("right")}
          title="Deck"
        >
          Deck
        </ActionButton>
      </MobileToggleRow>

      {!(isMobile && mobileColumnView === "right") && (
        <>
          <DomainFilters
            filters={filters}
            setFilters={setFilters}
            availableDomains={availableDomains}
            domainIcons={domainIcons}
          />
          <AdvancedFiltersPanel expanded={showAdvanced}>
            <AdvancedGrid>
              <SlidersColumn>
                <StatSliders filters={filters} setFilters={setFilters} />
              </SlidersColumn>

              <ChipsColumn>
                {!disableTypeFilter && (
                  <>
                    <CardTypeFilters
                      filters={filters}
                      setFilters={setFilters}
                    />
                    <RarityFilters
                      filters={filters}
                      setFilters={setFilters}
                      rarityIcons={rarityIcons}
                    />
                  </>
                )}
              </ChipsColumn>
            </AdvancedGrid>
          </AdvancedFiltersPanel>
        </>
      )}
    </SearchControls>
  );
}
export default CardFilters;
