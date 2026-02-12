import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import CardList from "../components/CardList";
import CardFilters from "../components/CardFilters";
import Deck from "../components/Deck";
import CardDetailPopup from "../components/CardDetailPopup";
import { useDeck } from "../hooks/useDeck";
import * as api from "../services/riftbound-api";
import { useToast } from "../components/Toast";
import "../App.css";
import "./DeckEditPage.css";

function DeckEditPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1 });
  const [selectedCard, setSelectedCard] = useState(null);
  const { showToast } = useToast();
  const filtersInitialized = useRef(false);
  const prevDeckLength = useRef(0);

  // EL EDITOR SIEMPRE USA GRID
  const viewMode = "grid";

  const [filters, setFilters] = useState({
    q: "",
    domains: [],
    type: "Legend",
    activeSection: "legend",
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
    isSideboardContext: false,
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

  // Load domains on mount
  useEffect(() => {
    const loadDomains = async () => {
      const domains = await api.fetchDomains();
      setAvailableDomains(domains);
    };
    loadDomains();
  }, []);

  // Sync deckId with hook
  useEffect(() => {
    if (deckId) {
      setSelectedDeckById(parseInt(deckId));
    }
  }, [deckId, setSelectedDeckById]);

  // Initial filter setup
  useEffect(() => {
    if (selectedDeck && !filtersInitialized.current && deck.length > 0) {
      const hasLegend = deck.some(
        (c) => c.type === "Legend" && !c.is_sideboard,
      );
      const battlefieldsCount = deck.filter(
        (c) => c.type === "Battlefield" && !c.is_sideboard,
      ).length;

      if (!hasLegend) {
        setFilters((prev) => ({
          ...prev,
          type: "Legend",
          activeSection: "legend",
        }));
      } else if (battlefieldsCount < 3) {
        setFilters((prev) => ({
          ...prev,
          type: "Battlefield",
          activeSection: "battlefield",
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          type: "Unit,Spell,Gear,Champion",
          activeSection: "main",
        }));
      }
      filtersInitialized.current = true;
    }
  }, [selectedDeck, deck.length]);

  // Auto-advance logic
  useEffect(() => {
    const isAddingCard = deck.length > prevDeckLength.current;
    prevDeckLength.current = deck.length;

    if (!selectedDeck || !filtersInitialized.current || !isAddingCard) return;

    const hasLegend = deck.some((c) => c.type === "Legend" && !c.is_sideboard);
    const battlefieldsCount = deck.filter(
      (c) => c.type === "Battlefield" && !c.is_sideboard,
    ).length;

    if (
      hasLegend &&
      filters.type === "Legend" &&
      filters.activeSection === "legend"
    ) {
      setFilters((prev) => ({
        ...prev,
        activeSection: battlefieldsCount < 3 ? "battlefield" : "main",
        type:
          battlefieldsCount < 3 ? "Battlefield" : "Unit,Spell,Gear,Champion",
      }));
    } else if (
      battlefieldsCount === 3 &&
      filters.type === "Battlefield" &&
      filters.activeSection === "battlefield"
    ) {
      setFilters((prev) => ({
        ...prev,
        activeSection: "main",
        type: "Unit,Spell,Gear,Champion",
      }));
    }
  }, [deck.length, selectedDeck]);

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
        activeSection: sectionType,
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
          return { ...baseFilters, type: "Unit,Spell,Gear,Champion,Rune" };
        default:
          return baseFilters;
      }
    });
  }, []);

  const fetchCards = useCallback(async () => {
    try {
      const currentLegend = deck.find(
        (c) => c.type === "Legend" && !c.is_sideboard,
      );
      const params = {
        ...filters,
        legendTags: currentLegend?.tags || "",
        domains: filters.domains?.join(",") || "",
      };

      // Remove empty or default values to keep URL clean
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === undefined ||
          params[key] === null
        ) {
          delete params[key];
        }
      });

      const result = await api.fetchCards(params);
      setCards(result.cards);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Error fetching cards:", err);
    }
  }, [filters, deck]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleAddCardToDeck = async (card, isSideboard = false) => {
    const targetIsSideboard = filters.isSideboardContext || isSideboard;
    const currentGlobalCopies = cardCounts[card.name] || 0;

    // Validation logic
    if (card.type === "Legend" && currentGlobalCopies >= 1) {
      showToast("You can only have 1 copy of a Legend.", "error");
      return;
    }

    if (
      card.type !== "Rune" &&
      card.type !== "Legend" &&
      card.type !== "Battlefield" &&
      currentGlobalCopies >= 3
    ) {
      showToast(
        `You cannot have more than 3 copies of '${card.name}' in total.`,
        "error",
      );
      return;
    }

    if (targetIsSideboard) {
      if (card.type === "Battlefield" || card.type === "Legend") {
        showToast(`${card.type}s cannot be added to the sideboard.`, "error");
        return;
      }
      const sideboardCount = deck.filter((c) => c.is_sideboard).length;
      if (sideboardCount >= 8) {
        showToast("Sideboard is full (max 8 cards).", "error");
        return;
      }
      await addCardToDeck(selectedDeck.id, card.id, true);
    } else {
      if (card.type === "Legend") {
        const legend = deck.find((c) => c.type === "Legend" && !c.is_sideboard);
        if (legend) await removeCardFromDeck(selectedDeck.id, legend.id, false);
        await addCardToDeck(selectedDeck.id, card.id, false);
      } else if (card.type === "Battlefield") {
        const count = deck.filter(
          (c) => c.type === "Battlefield" && !c.is_sideboard,
        ).length;
        if (count < 3) await addCardToDeck(selectedDeck.id, card.id, false);
        else showToast("You can only have 3 Battlefields.", "error");
      } else if (card.type === "Rune") {
        const count = deck.filter(
          (c) => c.type === "Rune" && !c.is_sideboard,
        ).length;
        if (count < 12) await addCardToDeck(selectedDeck.id, card.id, false);
        else showToast("You can only have 12 Runes.", "error");
      } else {
        const mainDeckCount = deck.filter(
          (c) =>
            c.type !== "Legend" &&
            c.type !== "Battlefield" &&
            c.type !== "Rune" &&
            !c.is_sideboard,
        ).length;
        if (mainDeckCount < 40)
          await addCardToDeck(selectedDeck.id, card.id, false);
        else showToast("Main deck is full (max 40 cards).", "error");
      }
    }
  };

  const handleDeleteDeck = async (id) => {
    if (window.confirm("Are you certain you want to delete this deck?")) {
      if (await deleteDeck(id)) navigate("/");
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
              setViewMode={() => {}}
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
              removeCardFromDeck={(id, isSb) =>
                removeCardFromDeck(selectedDeck.id, id, isSb)
              }
              addCardToDeck={handleAddCardToDeck}
              mainChampionId={selectedDeck.main_champion_id}
              setMainChampionId={setMainChampionId}
              updateDeckMetadata={updateDeckMetadata}
              onDeleteDeck={handleDeleteDeck}
              isEditingMode={true}
              setIsEditingMode={() => navigate(`/view/${deckId}`)}
              viewMode={viewMode}
              setSelectedCard={setSelectedCard}
              onSectionClick={handleSectionClick}
              activeSection={filters.activeSection}
              sort={filters.sort}
              order={filters.order}
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
