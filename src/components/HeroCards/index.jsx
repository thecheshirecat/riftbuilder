import React, { useState, useEffect } from "react";
import styled, { css } from "styled-components";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.4;
`;

const Perspective = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  perspective: 2000px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardWrapper = styled.div`
  position: absolute;
  width: 280px;
  height: 390px;
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  pointer-events: none;

  ${(props) =>
    props.index === 1 &&
    css`
      transform: translate3d(-350px, -50px, -200px) rotateY(25deg) rotateX(10deg);
      z-index: 1;
    `}

  ${(props) =>
    props.index === 2 &&
    css`
      transform: translate3d(-150px, 50px, -100px) rotateY(15deg) rotateX(5deg);
      z-index: 2;
    `}

  ${(props) =>
    props.index === 3 &&
    css`
      transform: translate3d(150px, -30px, -50px) rotateY(-15deg) rotateX(5deg);
      z-index: 3;
    `}

  ${(props) =>
    props.index === 4 &&
    css`
      transform: translate3d(380px, 40px, -150px) rotateY(-25deg) rotateX(10deg);
      z-index: 1;
    `}

  @media (max-width: 1000px) {
    width: 200px;
    height: 280px;

    ${(props) =>
      props.index === 1 &&
      css`
        transform: translate3d(-200px, -30px, -200px) rotateY(20deg);
      `}

    ${(props) =>
      props.index === 2 &&
      css`
        transform: translate3d(-80px, 30px, -100px) rotateY(10deg);
      `}

    ${(props) =>
      props.index === 3 &&
      css`
        transform: translate3d(80px, -20px, -50px) rotateY(-10deg);
      `}

    ${(props) =>
      props.index === 4 &&
      css`
        transform: translate3d(200px, 20px, -150px) rotateY(-20deg);
      `}
  }
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transform-style: preserve-3d;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const CardShine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0) 45%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 55%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 200%;
  transition: all 0.5s ease;
  pointer-events: none;
`;

const CardShadow = styled.div`
  position: absolute;
  bottom: -20px;
  left: 5%;
  width: 90%;
  height: 20px;
  background: rgba(0, 0, 0, 0.4);
  filter: blur(15px);
  border-radius: 50%;
  z-index: -1;
  transition: all 0.5s ease;
`;

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
    <Container>
      <Perspective>
        {cardImages.map((src, index) => (
          <CardWrapper key={index} index={index + 1}>
            <CardInner>
              <img src={src} alt={`Rift Card ${index + 1}`} />
              <CardShine />
            </CardInner>
            <CardShadow />
          </CardWrapper>
        ))}
      </Perspective>
    </Container>
  );
};

export default HeroCards;
