import React from "react";
import "./CardFilters.css";
import { safeParse } from "../utils/cardUtils";
import BodyIcon from "../assets/domains/Body.webp";
import CalmIcon from "../assets/domains/Calm.webp";
import ChaosIcon from "../assets/domains/Chaos.webp";
import FuryIcon from "../assets/domains/Fury.webp";
import MindIcon from "../assets/domains/Mind.webp";
import OrderIcon from "../assets/domains/Order.webp";

const domainIcons = {
  Body: BodyIcon,
  Calm: CalmIcon,
  Chaos: ChaosIcon,
  Fury: FuryIcon,
  Mind: MindIcon,
  Order: OrderIcon,
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

  // Filter out 'Colorless' as requested
  const filteredDomains = availableDomains.filter((d) => d !== "Colorless");

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

    return (
      <div className="stat-row">
        <label>
          {label}: {minVal} - {maxVal}
        </label>
        <div className="dual-range-container">
          <div className="slider-track"></div>
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
            style={{ zIndex: moved === "min" ? 5 : 4 }}
            onChange={(e) =>
              handleStatChange(minProp, e.target.value, true, limit)
            }
            onMouseDown={() =>
              setLastMoved((p) => ({ ...p, [baseName]: "min" }))
            }
          />
          <input
            type="range"
            min="0"
            max={limit}
            step="1"
            value={maxVal}
            className="range-input max-range"
            style={{ zIndex: moved === "max" ? 5 : 4 }}
            onChange={(e) =>
              handleStatChange(maxProp, e.target.value, false, limit)
            }
            onMouseDown={() =>
              setLastMoved((p) => ({ ...p, [baseName]: "max" }))
            }
          />
        </div>
      </div>
    );
  };

  return (
    <div className="search-controls">
      <div className="filter-group">
        <input
          type="text"
          placeholder="Search name or text..."
          value={filters.q}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, q: e.target.value, page: 1 }))
          }
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <label>Domains (Max 2):</label>
        <div className="domain-icon-container">
          {filteredDomains.map((d) => {
            const isSelected = filters.domains.includes(d);
            const iconSrc = domainIcons[d];

            if (!iconSrc) return null;

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
                      if (newDomains.length < 2) {
                        newDomains.push(d);
                      }
                    }
                    return { ...prev, domains: newDomains, page: 1 };
                  });
                }}
                title={d}
              >
                <img src={iconSrc} alt={d} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="advanced-toggle-wrapper">
        <button
          className={`advanced-toggle-btn ${showAdvanced ? "active" : ""}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Hide" : "Show"} Advanced Filters
          <span className="chevron-icon">▼</span>
        </button>
      </div>

      {showAdvanced && (
        <div className="advanced-filters-content">
          <div className="stat-slider-group">
            {renderDualSlider("Energy", "energy_min", "energy_max", 12)}
            {renderDualSlider("Power", "power_min", "power_max", 4)}
            {renderDualSlider("Might", "might_min", "might_max", 12)}
          </div>

          <div
            className="filter-group"
            style={{
              marginTop: "20px",
              borderTop: "1px dashed rgba(255,255,255,0.1)",
              paddingTop: "15px",
            }}
          >
            <label>Sorting & Type</label>
            <div className="flex-row">
              <select
                value={filters.sort}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, sort: e.target.value, page: 1 }))
                }
              >
                <option value="name">Name</option>
                <option value="energy">Energy</option>
                <option value="power">Power</option>
                <option value="might">Might</option>
              </select>
              <select
                value={filters.order}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, order: e.target.value, page: 1 }))
                }
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </select>

              {!disableTypeFilter && (
                <select
                  value={filters.type || ""}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, type: e.target.value, page: 1 }))
                  }
                >
                  <option value="">All Types</option>
                  <option value="Unit">Unit</option>
                  <option value="Spell">Spell</option>
                  <option value="Gear">Gear</option>
                  <option value="Champion">Champion</option>
                </select>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CardFilters;
