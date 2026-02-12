import React, { useState, useEffect } from "react";
import "./HeroCards.css";

const HeroCards = () => {
  const [cardImages, setCardImages] = useState([]);

  useEffect(() => {
    const fetchRandomCards = async () => {
      try {
        const res = await fetch(
          "http://localhost:3001/api/cards/random?count=4",
        );
        const data = await res.json();
        if (data && data.length > 0) {
          setCardImages(data);
        }
      } catch (err) {
        console.error("Error fetching random cards for hero:", err);
        // Fallback en caso de error
        setCardImages([
          "https://api.riftcodex.com/media/cards/images/1.webp",
          "https://api.riftcodex.com/media/cards/images/2.webp",
          "https://api.riftcodex.com/media/cards/images/3.webp",
          "https://api.riftcodex.com/media/cards/images/4.webp",
        ]);
      }
    };

    fetchRandomCards();
  }, []);

  if (cardImages.length === 0) return null;

  return (
    <div className="hero-cards-container">
      <div className="hero-cards-perspective">
        {cardImages.map((src, index) => (
          <div key={index} className={`hero-card card-${index + 1}`}>
            <div className="hero-card-inner">
              <img src={src} alt={`Rift Card ${index + 1}`} />
              <div className="hero-card-shine"></div>
            </div>
            <div className="hero-card-shadow"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroCards;
