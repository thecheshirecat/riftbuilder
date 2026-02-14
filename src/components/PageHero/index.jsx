import React from "react";
import styled from "styled-components";

const HeroWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 60px;
  overflow: hidden;
  border-radius: 20px;
  transition: ${(props) => props.theme.effects.transition};
  cursor: ${(props) => (props.onClick ? "pointer" : "default")};
  background-image: url(${(props) => props.backgroundImage});
  background-size: cover;
  background-position: top;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    max-width: 90%;
    margin: 0 auto 40px;
  }
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    max-width: 95%;
    margin: 0 auto 24px;
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }

  &:hover {
    ${(props) =>
      props.onClick &&
      `
      transform: translateY(-5px);
      border-color: ${props.theme.colors.primary};
      box-shadow: 0 0 30px rgba(77, 171, 247, 0.2);
    `}
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 3rem 2rem;
  text-align: center;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    padding: 2rem 1.5rem;
  }
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: 1.5rem 1rem;
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #fff, #888);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  letter-spacing: -1px;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    font-size: 2.5rem;
  }
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #fff;
  margin: 0;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    font-size: 1rem;
  }
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 0.95rem;
  }
`;

function PageHero({ title, subtitle, backgroundImage, onClick }) {
  return (
    <HeroWrapper backgroundImage={backgroundImage} onClick={onClick}>
      <HeroContent>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </HeroContent>
    </HeroWrapper>
  );
}

export default PageHero;
