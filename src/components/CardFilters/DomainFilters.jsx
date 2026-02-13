import React from "react";
import styled from "styled-components";

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
    props.selected ? props.theme.colors.primary : "rgba(255, 255, 255, 0.08)"};
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

const DomainFilters = ({
  filters,
  setFilters,
  availableDomains,
  domainIcons,
}) => {
  const filteredDomains = (availableDomains || []).filter(
    (d) => d !== "Colorless"
  );

  const toggleDomain = (d) => {
    setFilters((prev) => {
      let newDomains = [...prev.domains];
      const isSelected = newDomains.includes(d);
      if (isSelected) {
        newDomains = newDomains.filter((domain) => domain !== d);
      } else {
        if (newDomains.length < 2) newDomains.push(d);
      }
      return { ...prev, domains: newDomains, page: 1 };
    });
  };

  return (
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
              onClick={() => toggleDomain(d)}
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
  );
};

export default DomainFilters;
