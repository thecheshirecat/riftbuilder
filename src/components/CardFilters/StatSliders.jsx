import React from "react";
import styled from "styled-components";
import { safeParse } from "../../utils/cardUtils";

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

const StatSliders = ({ filters, setFilters }) => {
  const [lastMoved, setLastMoved] = React.useState({});

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

    const zIndexMin = moved === "min" || minVal === limit ? 11 : 10;
    const zIndexMax = moved === "max" || maxVal === 0 ? 11 : 10;

    return (
      <StatRow key={baseName}>
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
    <>
      {renderDualSlider("Energy", "energy_min", "energy_max", 12)}
      {renderDualSlider("Power", "power_min", "power_max", 4)}
      {renderDualSlider("Might", "might_min", "might_max", 12)}
    </>
  );
};

export default StatSliders;
