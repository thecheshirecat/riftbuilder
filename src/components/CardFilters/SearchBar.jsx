import React from "react";
import styled, { css } from "styled-components";

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

const SearchBar = ({ query, setFilters }) => {
  return (
    <SearchInputWrapper>
      <SearchIcon>🔍</SearchIcon>
      <SearchInput
        type="text"
        placeholder="Search cards..."
        value={query}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, q: e.target.value, page: 1 }))
        }
      />
      {query && (
        <ClearSearch
          onClick={() => setFilters((p) => ({ ...p, q: "", page: 1 }))}
        >
          ✕
        </ClearSearch>
      )}
    </SearchInputWrapper>
  );
};

export default SearchBar;
