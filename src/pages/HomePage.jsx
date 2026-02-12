import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroCards from "../components/HeroCards";
import * as api from "../services/riftbound-api";
import { useToast } from "../components/Toast";
import "./HomePage.css";

function HomePage() {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = JSON.parse(localStorage.getItem("riftbound_user"));

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const data = await api.fetchDecks(user?.id);
        setDecks(data);
      } catch (err) {
        console.error("Error fetching decks:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDecks();
  }, [user?.id]);

  const handleQuickCreate = async () => {
    if (!user) {
      showToast("Please login to create a deck", "info");
      navigate("/login");
      return;
    }

    try {
      const defaultName = `New Deck ${new Date().toLocaleDateString()}`;
      const data = await api.createDeck(defaultName, user.id);
      if (data && data.id) {
        navigate(`/edit/${data.id}`);
      }
    } catch (err) {
      console.error("Error creating deck:", err);
      showToast("Failed to create deck", "error");
    }
  };

  const handleSelectDeck = (deckId) => {
    navigate(`/view/${deckId}`);
  };

  return (
    <div
      className="landing-page"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <HeroCards />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <header className="landing-header">
          <div className="hero-content" onClick={handleQuickCreate}>
            <h1>Forge Your Deck</h1>
            <p className="hero-subtitle">
              Click here to start building your next masterpiece
            </p>
            <div className="hero-cta">
              <span>Create New Deck</span>
            </div>
          </div>
        </header>

        <div className="landing-content">
          <section className="saved-decks-section">
            <div className="section-header">
              <h2>Latest Decks</h2>
            </div>
            {isLoading ? (
              <div className="loading">Summoning your decks...</div>
            ) : decks.length > 0 ? (
              <div className="decks-grid">
                {decks.map((deck) => (
                  <div
                    key={deck.id}
                    className="deck-card"
                    onClick={() => handleSelectDeck(deck.id)}
                  >
                    <div className="deck-card-glow"></div>
                    <h3>{deck.name}</h3>
                    <div className="deck-stats">{deck.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No decks found. Time to forge your first one!</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
