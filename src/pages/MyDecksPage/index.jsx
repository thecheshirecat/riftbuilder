import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../../services/riftbound-api";
import { useToast } from "../../components/Toast/index";
import LatestDecks from "../../components/LatestDecks/index";
import PageHero from "../../components/PageHero/index";
import Layout from "../../components/Layout/index";
import heroBg from "../../assets/backgrounds/hero.webp";
import "./MyDecksPage.scss";

function MyDecksPage() {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // -- Referencias --
  const hasRedirected = React.useRef(false);

  // -- Seguridad y Datos --
  const user = JSON.parse(localStorage.getItem("riftbound_user"));

  useEffect(() => {
    if (!user && !hasRedirected.current) {
      hasRedirected.current = true;
      showToast("Please login to view your decks", "info");
      navigate("/login");
      return;
    }

    if (user) {
      const loadDecks = async () => {
        try {
          const result = await api.fetchDecks(user.id, 1, 100); // Para My Decks cargamos muchos por ahora
          setDecks(result.data || []);
        } catch (err) {
          console.error("Error loading decks:", err);
          showToast("Error loading your decks", "error");
        } finally {
          setIsLoading(false);
        }
      };
      loadDecks();
    }
  }, [user, navigate, showToast]);

  const handleCreateDeck = async () => {
    try {
      const defaultName = `New Deck ${new Date().toLocaleDateString()}`;
      const data = await api.createDeck(defaultName, user.id);
      if (data && data.id) {
        navigate(`/edit/${data.id}`);
      }
    } catch (err) {
      showToast("Error creating deck", "error");
    }
  };

  const handleSelectDeck = (id) => {
    navigate(`/view/${id}`);
  };

  if (!user || hasRedirected.current) {
    return <div className="loading-text">Redirecting to login...</div>;
  }

  return (
    <div className="my-decks-page">
      <Layout>
        <PageHero
          title="My Collection"
          subtitle="Manage your existing decks or forge a new path"
          backgroundImage={heroBg}
          onClick={handleCreateDeck}
        />

        <main className="decks-section">
          <LatestDecks
            decks={decks}
            isLoading={isLoading}
            onSelectDeck={handleSelectDeck}
            title="My Decks"
          />
        </main>
      </Layout>
    </div>
  );
}

export default MyDecksPage;
