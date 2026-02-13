import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/riftbound-api";
import LatestDecks from "../components/LatestDecks";
import "./MyDecksPage.css"; // Reusamos estilos similares

function DecksGalleryPage() {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDecks = async () => {
      try {
        const data = await api.fetchDecks(); // Trae todos los mazos públicos
        setDecks(data);
      } catch (err) {
        console.error("Error loading gallery:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDecks();
  }, []);

  const handleSelectDeck = (id) => {
    navigate(`/view/${id}`);
  };

  return (
    <div className="my-decks-page gallery-page">
      <div className="content-wrapper">
        <header className="page-header">
          <div className="header-hero no-hover">
            <h1>Deck Gallery</h1>
            <p>Explore all valid decks from the community</p>
          </div>
        </header>

        <main className="decks-section">
          <LatestDecks
            decks={decks}
            isLoading={isLoading}
            onSelectDeck={handleSelectDeck}
            title="Public Library"
            showSeeMore={false}
          />
        </main>
      </div>
    </div>
  );
}

export default DecksGalleryPage;
