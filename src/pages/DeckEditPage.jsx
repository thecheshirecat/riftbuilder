import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CardList from "../components/CardList";
import CardFilters from "../components/CardFilters";
import Deck from "../components/Deck";
import CardDetailPopup from "../components/CardDetailPopup";
import { useDeck } from "../hooks/useDeck";
import { validateDeck, getGlobalCardCounts } from "../utils/cardUtils";
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

  // EL EDITOR SIEMPRE USA GRID
  const viewMode = "grid";

  const [filters, setFilters] = useState({
    q: "",
    domains: [],
    type: "",
    energy_min: 0,
    energy_max: 12,
    power_min: 0,
    power_max: 4,
    might_min: 0,
    might_max: 12,
    sort: "name",
    order: "ASC",
    page: 1,
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
      const params = new URLSearchParams({
        ...filters,
        domains: filters.domains.join(","),
        page: filters.page,
      });
      const res = await fetch(`${API_BASE}/cards?${params.toString()}`);
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
    const currentGlobalCopies = globalCardCounts[card.name] || 0;

    // 1. Check Global Limit (Shared between Main and Sideboard)
    if (card.type === "Legend") {
      if (currentGlobalCopies >= 1) {
        alert("You can only have 1 copy of a Legend.");
        return;
      }
    } else if (card.type === "Rune") {
      // Runes have no copy limit (just the total deck limit of 12)
    } else {
      if (currentGlobalCopies >= 3) {
        alert(
          `You cannot have more than 3 copies of '${card.name}' in total (Main + Sideboard).`,
        );
        return;
      }
    }

    // 2. Section Specific Logic
    if (isSideboard) {
      const sideboardCount = deck.filter((c) => c.is_sideboard).length;
      if (sideboardCount >= 8) {
        alert("Sideboard is full (max 8 cards).");
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
          alert("You can only have 3 Battlefields in your main deck.");
        }
      } else if (card.type === "Rune") {
        const runes = deck.filter((c) => c.type === "Rune" && !c.is_sideboard);
        if (runes.length < 12) {
          await addCardToDeck(selectedDeck.id, card.id, false);
        } else {
          alert("You can only have 12 Runes in your main deck.");
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
          alert("Main deck is full (max 40 cards).");
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
            />
          </section>
        </div>
      </main>

      {selectedCard && (
        <CardDetailPopup
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}

export default DeckEditPage;
