import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroCards from "../components/HeroCards";
import "./HomePage.css";

const API_BASE = "http://localhost:3001/api";

function HomePage() {
  const [decks, setDecks] = useState([]);
  const [newDeckName, setNewDeckName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/decks`);
      const data = await res.json();
      setDecks(data);
    } catch (err) {
      console.error("Error fetching decks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeckName }),
      });
      const data = await res.json();
      // Al crear un deck, vamos directamente al editor
      navigate(`/edit/${data.id}`);
    } catch (err) {
      console.error("Error creating deck:", err);
    }
  };

  const handleSelectDeck = (deckId) => {
    // Al seleccionar un deck, vamos a la vista pública
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
