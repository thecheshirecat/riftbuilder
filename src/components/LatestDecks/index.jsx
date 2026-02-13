import React from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Section = styled.div`
  width: 100%;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
  text-align: left;
  letter-spacing: -0.025em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const SeeMoreLink = styled(Link)`
  color: ${(props) => props.theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: ${(props) => props.theme.effects.transition};
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(77, 171, 247, 0.1);

  &:hover {
    background: rgba(77, 171, 247, 0.2);
    transform: translateX(5px);
    color: #60a5fa;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  width: 100%;
  margin: 0 auto;
`;

const DeckCard = styled.div`
  background: rgba(30, 41, 59, 1);
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  padding: 15px;
  border-radius: 20px;
  transition: ${(props) => props.theme.effects.transition};
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: ${(props) => props.theme.shadows.main};

  &:hover {
    transform: translateY(-8px);
    border-color: ${(props) => props.theme.colors.primary};
    background: #26334a;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  }
`;

const CardImage = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  background: #1e293b;
  transition: background 0.3s ease;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    transition: transform 0.5s ease;
  }

  ${DeckCard}:hover & img {
    transform: scale(1.1);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(30, 41, 59, 1) 0%, transparent 100%);
  z-index: 2;
  transition: background 0.3s ease;

  ${DeckCard}:hover & {
    background: linear-gradient(to top, #26334a 0%, transparent 100%);
  }
`;

const CardContent = styled.div`
  position: relative;
  z-index: 3;
  padding: 15px;
  padding-bottom: 0;
  margin-top: -50px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const DeckInfo = styled.div`
  h3 {
    margin: 0;
    font-size: 1.4rem;
    color: #fff;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const DeckFooter = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Author = styled.span`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.primary};
  font-weight: 600;
  letter-spacing: 0.025em;
`;

const StatusWrapper = styled.div`
  text-align: center;
  padding: 60px 20px;
  width: 100%;
  color: #94a3b8;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(77, 171, 247, 0.1);
  border-top-color: ${(props) => props.theme.colors.primary};
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: ${spin} 1s linear infinite;
`;

const LatestDecks = ({
  decks,
  isLoading,
  onSelectDeck,
  title,
  showSeeMore,
}) => {
  if (isLoading) {
    return (
      <Section>
        <SectionHeader>{title && <Title>{title}</Title>}</SectionHeader>
        <StatusWrapper>
          <Spinner />
          <p>Summoning decks...</p>
        </StatusWrapper>
      </Section>
    );
  }

  if (!decks || decks.length === 0) {
    return (
      <Section>
        <SectionHeader>{title && <Title>{title}</Title>}</SectionHeader>
        <StatusWrapper>
          <p>No decks found. Time to forge your first one!</p>
        </StatusWrapper>
      </Section>
    );
  }

  return (
    <Section>
      <SectionHeader>
        {title && <Title>{title}</Title>}
        {showSeeMore && <SeeMoreLink to="/decks">See More →</SeeMoreLink>}
      </SectionHeader>
      <Grid>
        {decks.map((deck) => (
          <DeckCard key={deck.id} onClick={() => onSelectDeck(deck.id)}>
            <CardImage>
              <img
                src={
                  deck.legend_image ||
                  `https://api.riftcodex.com/media/cards/images/1.webp`
                }
                alt={deck.name}
                onError={(e) => {
                  e.target.src =
                    "https://api.riftcodex.com/media/cards/images/1.webp";
                }}
              />
              <ImageOverlay />
            </CardImage>

            <CardContent>
              <DeckInfo>
                <h3>{deck.name}</h3>
                <p>{deck.description || "No description provided."}</p>
              </DeckInfo>

              <DeckFooter>
                <Author>@{deck.username || "Anonymous"}</Author>
              </DeckFooter>
            </CardContent>
          </DeckCard>
        ))}
      </Grid>
    </Section>
  );
};

export default LatestDecks;
