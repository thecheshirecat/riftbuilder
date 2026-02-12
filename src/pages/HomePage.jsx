import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroCards from "../components/HeroCards";
import * as api from "../services/riftbound-api";
import "./HomePage.css";

function HomePage() {
  const [decks, setDecks] = useState([]);
  const [newDeckName, setNewDeckName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const data = await api.fetchDecks();
        setDecks(data);
      } catch (err) {
        console.error("Error fetching decks:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDecks();
  }, []);

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    try {
      const data = await api.createDeck(newDeckName);
      if (data && data.id) {
        navigate(`/edit/${data.id}`);
      }
    } catch (err) {
      console.error("Error creating deck:", err);
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
          <h1>Riftbound Deck Builder</h1>
          <p>Strategize. Build. Conquer.</p>
        </header>

        <div className="landing-content">
          <section className="create-deck-section">
            <h2>Start a New Masterpiece</h2>
            <form className="create-deck-form" onSubmit={handleCreateDeck}>
              <input
                type="text"
                placeholder="Deck Name (e.g. 'Fury & Chaos Aggro')"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                Create Deck
              </button>
            </form>
          </section>

          <section className="saved-decks-section">
            <h2>Your Saved Decks</h2>
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
                    <div className="deck-stats">
                      Click to load this deck and strategize.
                    </div>
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
