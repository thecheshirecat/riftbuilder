import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Deck from "../components/Deck";
import CardDetailPopup from "../components/CardDetailPopup";
import { useDeck } from "../hooks/useDeck";
import "../App.css";
import "./DeckViewPage.css";

function DeckViewPage() {
  // -- Hooks y Estado --
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid"); // 'grid' (mosaico) o 'list' (lista)
  const [selectedCard, setSelectedCard] = useState(null);

  // Custom hook para la gestión centralizada del mazo
  const {
    selectedDeck,
    deck,
    setSelectedDeckById,
    updateDeckMetadata,
    deleteDeck,
    setMainChampionId,
  } = useDeck(parseInt(deckId));

  // -- Efectos --
  /**
   * Asegura que el mazo correcto esté cargado cuando cambia el ID en la URL
   */
  useEffect(() => {
    if (deckId) {
      setSelectedDeckById(parseInt(deckId));
    }
  }, [deckId, setSelectedDeckById]);

  // -- Handlers --
  /**
   * Maneja la eliminación del mazo con confirmación del usuario
   */
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

  // -- Seguridad y Autenticación --
  const user = JSON.parse(localStorage.getItem("riftbound_user"));
  const isOwner = selectedDeck && user && selectedDeck.user_id === user.id;

  // -- Renderizado Condicional --
  if (!selectedDeck) return <div className="loading">Loading deck...</div>;

  return (
    <div className="App">
      <main className="App-main">
        <div className="content-grid full-deck">
          <section className="deck-section">
            {/* 
                Componente Deck: Se encarga de la visualización principal.
                isEditingMode={false} indica que estamos en modo lectura.
            */}
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
              isOwner={isOwner}
            />
          </section>
        </div>
      </main>

      {/* Popup de detalles de carta al hacer clic en una carta del mazo */}
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
