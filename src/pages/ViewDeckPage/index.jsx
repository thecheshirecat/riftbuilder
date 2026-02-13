import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Deck from "../../components/Deck/index";
import CardDetailPopup from "../../components/CardDetailPopup/index";
import Layout from "../../components/Layout/index";
import { useDeck } from "../../hooks/useDeck";
import "./ViewDeckPage.scss";

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
    error,
    isLoading,
  } = useDeck(parseInt(deckId));

  // -- Efectos --
  /**
   * Asegura que el mazo correcto esté cargado cuando cambia el ID en la URL
   * Si hay un error de acceso, redirige a la home.
   */
  useEffect(() => {
    if (deckId) {
      setSelectedDeckById(parseInt(deckId));
    }
  }, [deckId, setSelectedDeckById]);

  useEffect(() => {
    if (error === "This deck is private.") {
      const timer = setTimeout(() => {
        navigate("/");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

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
  if (isLoading)
    return (
      <Layout>
        <div className="loading-text">Loading deck...</div>
      </Layout>
    );

  if (error === "This deck is private.") {
    return (
      <Layout>
        <div className="error-container">
          <div className="error-message">
            <h2>Access Denied</h2>
            <p>This deck is private and can only be viewed by its owner.</p>
            <p className="redirect-hint">Redirecting to home in 5 seconds...</p>
            <button className="home-button" onClick={() => navigate("/")}>
              Go Home Now
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !selectedDeck) {
    return (
      <Layout>
        <div className="error-container">
          <div className="error-message">
            <h2>Deck Not Found</h2>
            <p>{error || "We couldn't find the deck you're looking for."}</p>
            <button className="home-button" onClick={() => navigate("/")}>
              Back to Safety
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="view-deck-page">
      <Layout>
        <div className="deck-view-container">
          <Deck
            deck={deck}
            selectedDeck={selectedDeck}
            mainChampionId={selectedDeck.main_champion_id}
            onUpdateMetadata={updateDeckMetadata}
            onDeleteDeck={handleDeleteDeck}
            onSetMainChampion={setMainChampionId}
            onCardClick={setSelectedCard}
            isOwner={isOwner}
            deckId={selectedDeck.id}
            isEditingMode={false}
            setIsEditingMode={() => navigate(`/edit/${deckId}`)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isPublic={selectedDeck.is_public}
          />
        </div>
      </Layout>

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
