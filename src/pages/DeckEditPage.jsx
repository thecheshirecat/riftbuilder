import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CardList from "../components/CardList";
import CardFilters from "../components/CardFilters";
import Deck from "../components/Deck";
import CardDetailPopup from "../components/CardDetailPopup";
import { useDeck } from "../hooks/useDeck";
import { validateDeck, getGlobalCardCounts } from "../utils/cardUtils";
import { useToast } from "../components/Toast";
import "../App.css";
import "./DeckEditPage.css";

const API_BASE = "http://localhost:3001/api";

function DeckEditPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1 });
  const [selectedCard, setSelectedCard] = useState(null);
  const { showToast } = useToast();

  // EL EDITOR SIEMPRE USA GRID
  const viewMode = "grid";

  const [filters, setFilters] = useState({
    q: "",
    domains: [],
    type: "Legend",
    rarity: "",
    energy_min: 0,
    energy_max: 12,
    power_min: 0,
    power_max: 4,
    might_min: 0,
    might_max: 12,
    sort: "name",
    order: "ASC",
    page: 1,
    isSideboardContext: false, // New context to know if we are adding to sideboard
  });

  const {
    selectedDeck,
    deck,
    cardCounts,
    setSelectedDeckById,
    updateDeckMetadata,
    deleteDeck,
    addCardToDeck,
    removeCardFromDeck,
    setMainChampionId,
  } = useDeck(parseInt(deckId));

  // Handler for section clicks to set filters
  const handleSectionClick = useCallback((sectionType) => {
    setFilters((prev) => {
      const baseFilters = {
        ...prev,
        q: "",
        energy_min: 0,
        energy_max: 12,
        power_min: 0,
        power_max: 4,
        might_min: 0,
        might_max: 12,
        page: 1,
        isSideboardContext: sectionType === "sideboard",
      };

      switch (sectionType) {
        case "legend":
          return { ...baseFilters, type: "Legend" };
        case "battlefield":
          return { ...baseFilters, type: "Battlefield" };
        case "main":
          return { ...baseFilters, type: "Unit,Spell,Gear,Champion" };
        case "runes":
          return { ...baseFilters, type: "Rune" };
        case "sideboard":
          return {
            ...baseFilters,
            type: "Unit,Spell,Gear,Champion,Rune",
          };
        default:
          return baseFilters;
      }
    });
  }, []);

  // Ref to track if we have initialized the filters for this deck session
  const filtersInitialized = React.useRef(false);

  // Initial filter setup ONLY on first load of the deck
  useEffect(() => {
    if (!selectedDeck || filtersInitialized.current || deck.length === 0)
      return;

    const hasLegend = deck.some((c) => c.type === "Legend" && !c.is_sideboard);
    const battlefieldsCount = deck.filter(
      (c) => c.type === "Battlefield" && !c.is_sideboard,
    ).length;

    if (hasLegend && battlefieldsCount === 3) {
      setFilters((prev) => ({
        ...prev,
        type: "Unit,Spell,Gear,Champion",
        isSideboardContext: false,
      }));
    } else if (!hasLegend) {
      setFilters((prev) => ({ ...prev, type: "Legend" }));
    } else if (battlefieldsCount < 3) {
      setFilters((prev) => ({ ...prev, type: "Battlefield" }));
    }

    filtersInitialized.current = true;
  }, [selectedDeck, deck.length === 0]); // Only run when deck goes from empty to loaded or on first load

  // Helper to clear auto-filters when requirements are met
  useEffect(() => {
    if (!selectedDeck || !filtersInitialized.current) return;

    const hasLegend = deck.some((c) => c.type === "Legend" && !c.is_sideboard);
    const battlefieldsCount = deck.filter(
      (c) => c.type === "Battlefield" && !c.is_sideboard,
    ).length;

    // Auto-advance logic: only trigger if we were in an "auto-filter" state
    if (hasLegend && filters.type === "Legend") {
      setFilters((prev) => ({
        ...prev,
        type:
          battlefieldsCount < 3 ? "Battlefield" : "Unit,Spell,Gear,Champion",
      }));
    } else if (battlefieldsCount === 3 && filters.type === "Battlefield") {
      setFilters((prev) => ({ ...prev, type: "Unit,Spell,Gear,Champion" }));
    }
  }, [deck.length, selectedDeck]);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await fetch(`${API_BASE}/domains`);
        const data = await res.json();
        setAvailableDomains(data);
      } catch (err) {
        console.error("Error fetching domains:", err);
      }
    };
    fetchDomains();
  }, []);

  useEffect(() => {
    if (deckId) {
      setSelectedDeckById(parseInt(deckId));
    }
  }, [deckId, setSelectedDeckById]);

  const fetchCards = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();

      // Add basic filters
      if (filters.q) queryParams.append("q", filters.q);
      if (filters.sort) queryParams.append("sort", filters.sort);
      if (filters.order) queryParams.append("order", filters.order);
      queryParams.append("page", filters.page);

      // Only add type filter if something is selected
      if (filters.type) {
        queryParams.append("type", filters.type);
      }

      // Only add rarity filter if something is selected
      if (filters.rarity) {
        // Use "rarity" parameter and send values as they are (Capitalized)
        queryParams.append("rarity", filters.rarity);
      }

      // Only add domain filter if something is selected
      if (filters.domains && filters.domains.length > 0) {
        queryParams.append("domains", filters.domains.join(","));
      }

      // Add stat filters
      queryParams.append("energy_min", filters.energy_min);
      queryParams.append("energy_max", filters.energy_max);
      queryParams.append("power_min", filters.power_min);
      queryParams.append("power_max", filters.power_max);
      queryParams.append("might_min", filters.might_min);
      queryParams.append("might_max", filters.might_max);

      const res = await fetch(`${API_BASE}/cards?${queryParams.toString()}`);
      const result = await res.json();
      setCards(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Error fetching cards:", err);
    }
  }, [filters]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Global card counts (Main + Sideboard)
  const globalCardCounts = React.useMemo(() => {
    const counts = {};
    deck.forEach((card) => {
      counts[card.name] = (counts[card.name] || 0) + 1;
    });
    return counts;
  }, [deck]);

  const handleAddCardToDeck = async (card, isSideboard = false) => {
    // If we are in sideboard context, default to sideboard unless explicitly told otherwise
    const targetIsSideboard = filters.isSideboardContext || isSideboard;

    const currentGlobalCopies = globalCardCounts[card.name] || 0;

    // 1. Check Global Limit (Shared between Main and Sideboard)
    if (card.type === "Legend") {
      if (currentGlobalCopies >= 1) {
        showToast("You can only have 1 copy of a Legend.", "error");
        return;
      }
    } else if (card.type === "Rune") {
      // Runes have no copy limit (just the total deck limit of 12)
    } else {
      if (currentGlobalCopies >= 3) {
        showToast(
          `You cannot have more than 3 copies of '${card.name}' in total (Main + Sideboard).`,
          "error",
        );
        return;
      }
    }

    // 2. Section Specific Logic
    if (targetIsSideboard) {
      if (card.type === "Battlefield") {
        showToast("Battlefields cannot be added to the sideboard.", "error");
        return;
      }
      if (card.type === "Legend") {
        showToast("Legends cannot be added to the sideboard.", "error");
        return;
      }
      const sideboardCount = deck.filter((c) => c.is_sideboard).length;
      if (sideboardCount >= 8) {
        showToast("Sideboard is full (max 8 cards).", "error");
        return;
      }
      await addCardToDeck(selectedDeck.id, card.id, true);
    } else {
      // Main Deck Specific Logic
      if (card.type === "Legend") {
        const legend = deck.find((c) => c.type === "Legend" && !c.is_sideboard);
        if (legend) {
          await removeCardFromDeck(selectedDeck.id, legend.id, false);
        }
        await addCardToDeck(selectedDeck.id, card.id, false);
      } else if (card.type === "Battlefield") {
        const battlefields = deck.filter(
          (c) => c.type === "Battlefield" && !c.is_sideboard,
        );
        if (battlefields.length < 3) {
          await addCardToDeck(selectedDeck.id, card.id, false);
        } else {
          showToast(
            "You can only have 3 Battlefields in your main deck.",
            "error",
          );
        }
      } else if (card.type === "Rune") {
        const runes = deck.filter((c) => c.type === "Rune" && !c.is_sideboard);
        if (runes.length < 12) {
          await addCardToDeck(selectedDeck.id, card.id, false);
        } else {
          showToast("You can only have 12 Runes in your main deck.", "error");
        }
      } else {
        const mainDeckCards = deck.filter(
          (c) =>
            c.type !== "Legend" &&
            c.type !== "Battlefield" &&
            c.type !== "Rune" &&
            !c.is_sideboard,
        );
        if (mainDeckCards.length < 40) {
          await addCardToDeck(selectedDeck.id, card.id, false);
        } else {
          showToast("Main deck is full (max 40 cards).", "error");
        }
      }
    }
  };

  const handleRemoveCardFromDeck = async (cardId, isSideboard = false) => {
    await removeCardFromDeck(selectedDeck.id, cardId, isSideboard);
  };

  const handleDeleteDeck = async (id) => {
    if (
      window.confirm(
        "Are you certain you want to delete this deck? All your changes will be lost.",
      )
    ) {
      const success = await deleteDeck(id);
      if (success) {
        navigate("/");
      }
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  if (!selectedDeck) return <div className="loading">Loading deck...</div>;

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <button
            className="back-btn"
            onClick={() => navigate(`/view/${deckId}`)}
          >
            ← Back to View
          </button>
          <h1>Editing: {selectedDeck.name}</h1>
        </div>
      </header>

      <main className="App-main">
        <div className="content-grid">
          <section className="card-list-section">
            <CardFilters
              filters={filters}
              setFilters={setFilters}
              availableDomains={availableDomains}
              viewMode={viewMode}
              setViewMode={() => {}} // Deshabilitado en edición
            />

            <CardList
              cards={cards}
              pagination={pagination}
              setPage={handlePageChange}
              setSelectedCard={setSelectedCard}
              addCardToDeck={handleAddCardToDeck}
              removeCardFromDeck={(cardId) =>
                removeCardFromDeck(selectedDeck.id, cardId)
              }
              cardCounts={cardCounts}
              viewMode={viewMode}
            />
          </section>

          <section className="deck-section">
            <Deck
              selectedDeck={selectedDeck}
              deck={deck}
              removeCardFromDeck={handleRemoveCardFromDeck}
              addCardToDeck={handleAddCardToDeck}
              mainChampionId={selectedDeck.main_champion_id}
              setMainChampionId={setMainChampionId}
              updateDeckMetadata={updateDeckMetadata}
              onDeleteDeck={handleDeleteDeck}
              isEditingMode={true}
              setIsEditingMode={() => navigate(`/view/${deckId}`)}
              viewMode={viewMode}
              setViewMode={() => {}} // Deshabilitado en edición
              setSelectedCard={setSelectedCard}
              onSectionClick={handleSectionClick}
              activeSection={
                filters.isSideboardContext ? "sideboard" : filters.type
              }
            />
          </section>
        </div>
      </main>

      {selectedCard && (
        <CardDetailPopup
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onAdd={handleAddCardToDeck}
        />
      )}
    </div>
  );
}

export default DeckEditPage;
