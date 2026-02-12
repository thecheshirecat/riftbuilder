import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeroCards from "../components/HeroCards";
import LatestDecks from "../components/LatestDecks";
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
        const data = await api.fetchDecks(); // Sin userId para traer los globales
        setDecks(data);
      } catch (err) {
        console.error("Error fetching decks:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDecks();
  }, []);

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
          </div>
        </header>

        <div className="landing-content">
          <section className="saved-decks-section">
            <LatestDecks
              decks={decks.slice(0, 10)}
              isLoading={isLoading}
              onSelectDeck={handleSelectDeck}
              title="Latest Decks"
            />

            {decks.length > 10 && (
              <button
                className="view-all-btn"
                onClick={() => navigate("/my-decks")}
              >
                View All Decks
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
