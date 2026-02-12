import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Deck from "../components/Deck";
import CardDetailPopup from "../components/CardDetailPopup";
import { useDeck } from "../hooks/useDeck";
import "../App.css";
import "./DeckViewPage.css";

function DeckViewPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedCard, setSelectedCard] = useState(null);

  const {
    selectedDeck,
    deck,
    setSelectedDeckById,
    updateDeckMetadata,
    deleteDeck,
    setMainChampionId,
  } = useDeck(parseInt(deckId));

  useEffect(() => {
    if (deckId) {
      setSelectedDeckById(parseInt(deckId));
    }
  }, [deckId, setSelectedDeckById]);

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

  if (!selectedDeck) return <div className="loading">Loading deck...</div>;

  return (
    <div className="App">
      <main className="App-main">
        <div className="content-grid full-deck">
          <section className="deck-section">
            <Deck
              selectedDeck={selectedDeck}
              deck={deck}
              mainChampionId={selectedDeck.main_champion_id}
              setMainChampionId={setMainChampionId}
              updateDeckMetadata={updateDeckMetadata}
              onDeleteDeck={handleDeleteDeck}
              isEditingMode={false}
              setIsEditingMode={() => navigate(`/edit/${deckId}`)}
              viewMode={viewMode}
              setViewMode={setViewMode}
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

export default DeckViewPage;
