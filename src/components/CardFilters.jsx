import React from "react";
import "./CardFilters.css";
import { safeParse } from "../utils/cardUtils";
import BodyIcon from "../assets/domains/Body.webp";
import CalmIcon from "../assets/domains/Calm.webp";
import ChaosIcon from "../assets/domains/Chaos.webp";
import FuryIcon from "../assets/domains/Fury.webp";
import MindIcon from "../assets/domains/Mind.webp";
import OrderIcon from "../assets/domains/Order.webp";
import CommonIcon from "../assets/rarity/common.webp";
import UncommonIcon from "../assets/rarity/uncommon.webp";
import RareIcon from "../assets/rarity/rare.webp";
import EpicIcon from "../assets/rarity/epic.webp";
import ShowcaseIcon from "../assets/rarity/showcase.webp";

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
      <div className="stat-row">
        <label>
          {label}: {minVal} - {maxVal}
        </label>
        <div className="dual-range-container">
          <div
            className="slider-progress"
            style={{
              left: `${(minVal / limit) * 100}%`,
              right: `${100 - (maxVal / limit) * 100}%`,
            }}
          ></div>
          <input
            type="range"
            min="0"
            max={limit}
            step="1"
            value={minVal}
            className="range-input min-range"
            style={{ zIndex: zIndexMin }}
            onChange={(e) =>
              handleStatChange(minProp, e.target.value, true, limit)
            }
          />
          <input
            type="range"
            min="0"
            max={limit}
            step="1"
            value={maxVal}
            className="range-input max-range"
            style={{ zIndex: zIndexMax }}
            onChange={(e) =>
              handleStatChange(maxProp, e.target.value, false, limit)
            }
          />
        </div>
      </div>
    );
  };

  return (
    <div className="search-controls">
      {/* Barra de búsqueda principal */}
      <div className="search-main-row">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search cards..."
            value={filters.q}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, q: e.target.value, page: 1 }))
            }
            className="search-input"
          />
          {filters.q && (
            <button
              className="clear-search"
              onClick={() => setFilters((p) => ({ ...p, q: "", page: 1 }))}
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-actions">
          <div className="custom-select-container" ref={sortRef}>
            <div
              className={`custom-select-trigger ${isSortOpen ? "open" : ""}`}
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              <span>{currentSortLabel}</span>
              <span className="select-arrow">▼</span>
            </div>
            {isSortOpen && (
              <div className="custom-options">
                {sortOptions.map((opt) => (
                  <div
                    key={opt.value}
                    className={`custom-option ${filters.sort === opt.value ? "selected" : ""}`}
                    onClick={() => {
                      setFilters((p) => ({ ...p, sort: opt.value, page: 1 }));
                      setIsSortOpen(false);
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className={`order-btn ${filters.order === "DESC" ? "desc" : "asc"}`}
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
          </button>

          <button
            className={`advanced-toggle-btn ${showAdvanced ? "active" : ""}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "Simple" : "Advanced"}
          </button>
        </div>
      </div>

      {/* Dominios - Siempre visibles pero más compactos */}
      <div className="filter-section domains-section">
        <div className="section-header">
          <span className="section-label">Domains</span>
          <span className="section-hint">Max 2</span>
        </div>
        <div className="domain-icon-container">
          {filteredDomains.map((d) => {
            const isSelected = filters.domains.includes(d);
            const iconSrc = domainIcons[d];

            return (
              <div
                key={d}
                className={`domain-icon ${isSelected ? "selected" : ""} ${!isSelected && filters.domains.length >= 2 ? "disabled" : ""}`}
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
                  <span className="domain-fallback-text">{d}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtros avanzados colapsables */}
      <div
        className={`advanced-filters-panel ${showAdvanced ? "expanded" : ""}`}
      >
        <div className="advanced-grid">
          {/* Columna de Sliders */}
          <div className="sliders-column">
            {renderDualSlider("Energy", "energy_min", "energy_max", 12)}
            {renderDualSlider("Power", "power_min", "power_max", 4)}
            {renderDualSlider("Might", "might_min", "might_max", 12)}
          </div>

          {/* Columna de Chips */}
          <div className="chips-column">
            {!disableTypeFilter && (
              <>
                <div className="chip-group">
                  <label>Card Types</label>
                  <div className="chip-container">
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

                      // Definimos las categorías
                      const isMainDeckType = [
                        "Unit",
                        "Spell",
                        "Gear",
                        "Champion",
                      ].includes(type);
                      const isSpecialType = [
                        "Rune",
                        "Battlefield",
                        "Legend",
                      ].includes(type);

                      // Lógica de deshabilitación basada en la sección activa (Deck Builder context)
                      const activeSection = filters.activeSection;
                      let isDisabled = false;

                      if (activeSection === "legend") {
                        isDisabled = type !== "Legend";
                      } else if (activeSection === "battlefield") {
                        isDisabled = type !== "Battlefield";
                      } else if (activeSection === "runes") {
                        isDisabled = type !== "Rune";
                      } else if (activeSection === "main") {
                        // En Main Deck solo permitimos Unit, Spell, Gear, Champion
                        isDisabled = !["Unit", "Spell", "Gear", "Champion"].includes(type);
                      } else if (activeSection === "sideboard") {
                        // En Sideboard permitimos casi todo menos Battlefield y Legend
                        isDisabled = ["Battlefield", "Legend"].includes(type);
                      } else {
                        // Fallback a lógica original si no hay sección activa (ej: vista pública)
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
                        <div
                          key={type}
                          className={`type-chip ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
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
                                  // Si seleccionas una especial, limpias todo lo demás (selección única para Legend/Rune/BF)
                                  newTypes = [type];
                                } else {
                                  // Si seleccionas Main Deck, añades a la lista
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
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="chip-group">
                  <label>Rarity</label>
                  <div className="chip-container">
                    {["Common", "Uncommon", "Rare", "Epic", "Showcase"].map(
                      (rarity) => {
                        const activeRarities = Array.isArray(filters.rarity)
                          ? filters.rarity
                          : filters.rarity
                            ? filters.rarity.split(",").filter(Boolean)
                            : [];
                        const isSelected = activeRarities.includes(rarity);

                        return (
                          <div
                            key={rarity}
                            className={`type-chip rarity-chip ${isSelected ? "selected" : ""}`}
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
                            <img
                              src={rarityIcons[rarity]}
                              alt={rarity}
                              className="rarity-mini-icon"
                            />
                            {rarity}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardFilters;
