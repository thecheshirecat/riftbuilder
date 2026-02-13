import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../../services/riftbound-api";
import LatestDecks from "../../components/LatestDecks/index";
import PageHero from "../../components/PageHero/index";
import HeroCards from "../../components/HeroCards/index";
import Layout from "../../components/Layout/index";
import heroBg from "../../assets/backgrounds/hero.webp";
import "./DecksGalleryPage.scss";

function DecksGalleryPage() {
  const [decks, setDecks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const navigate = useNavigate();

  const loadDecks = async (page = 1) => {
    setIsLoading(true);
    try {
      const result = await api.fetchDecks(null, page, 12);
      setDecks(result.data || []);
      setPagination(result.pagination || { page: 1, pages: 1 });
    } catch (err) {
      console.error("Error loading gallery:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDecks(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      loadDecks(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleSelectDeck = (id) => {
    navigate(`/view/${id}`);
  };

  return (
    <div className="decks-gallery-page">
      <HeroCards />
      <Layout>
        <PageHero
          title="Deck Gallery"
          subtitle="Explore all valid decks from the community"
          backgroundImage={heroBg}
        />

        <main className="decks-section">
          <LatestDecks
            decks={decks}
            isLoading={isLoading}
            onSelectDeck={handleSelectDeck}
            title={`Public Library (Page ${pagination.page} of ${pagination.pages})`}
            showSeeMore={false}
          />

          {pagination.pages > 1 && (
            <div className="pagination-controls">
              <button
                className="pagination-button"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </button>
              <div className="pagination-info">
                <span>
                  Page {pagination.page} of {pagination.pages}
                </span>
              </div>
              <button
                className="pagination-button"
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </Layout>
    </div>
  );
}

export default DecksGalleryPage;
