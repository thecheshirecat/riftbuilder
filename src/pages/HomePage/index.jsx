import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../../services/riftbound-api";
import { useToast } from "../../components/Toast/index";
import HeroCards from "../../components/HeroCards/index";
import PageHero from "../../components/PageHero/index";
import LatestDecks from "../../components/LatestDecks/index";
import Layout from "../../components/Layout/index";
import heroBg from "../../assets/backgrounds/hero.webp";
import "./HomePage.scss";

function HomePage() {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = JSON.parse(localStorage.getItem("riftbound_user"));

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const data = await api.fetchLatestDecks(7);
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
    <div className="home-page">
      <HeroCards />
      <Layout>
        <PageHero
          title="Forge Your Deck"
          subtitle="Click here to start building your next masterpiece"
          backgroundImage={heroBg}
          onClick={handleQuickCreate}
        />

        <div className="main-content">
          <section className="saved-decks-section">
            <LatestDecks
              decks={decks.slice(0, 6)}
              isLoading={isLoading}
              onSelectDeck={handleSelectDeck}
              title="Latest Decks"
              showSeeMore={decks.length > 6}
            />
          </section>
        </div>
      </Layout>
    </div>
  );
}

export default HomePage;
