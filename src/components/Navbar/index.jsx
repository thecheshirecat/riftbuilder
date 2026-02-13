import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as api from "../../services/riftbound-api";
import { useToast } from "../Toast/index";

const Nav = styled.nav`
  background: #1a1c23;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 0 20px;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1400px;
`;

const Logo = styled(Link)`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
  letter-spacing: 2px;
  background: linear-gradient(90deg, #fff, #888);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    display: ${(props) => (props.isOpen ? "flex" : "none")};
    position: absolute;
    top: 70px;
    left: 0;
    width: 100%;
    background: #1a1c23;
    flex-direction: column;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    gap: 15px;
  }
`;

const NavItem = styled(Link)`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: ${(props) => props.theme.effects.transition};
  padding: 8px 12px;
  border-radius: 6px;
  white-space: nowrap;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const NavButton = styled.button`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: ${(props) => props.theme.effects.transition};
  padding: 8px 12px;
  border-radius: 6px;
  white-space: nowrap;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 20px;
  background: ${(props) => props.theme.colors.borderColor};

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    width: 100%;
    height: 1px;
    margin: 5px 0;
  }
`;

const AuthBtn = styled(Link)`
  padding: 8px 18px;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  transition: ${(props) => props.theme.effects.transition};
  white-space: nowrap;

  &.login {
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
  }

  &.register {
    background: #fff;
    color: #0d1117;
    &:hover {
      background: #e0e0e0;
    }
  }

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    width: 100%;
  }
`;

const LogoutBtn = styled.button`
  padding: 8px 18px;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
  transition: ${(props) => props.theme.effects.transition};
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  font-family: inherit;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    width: 100%;
  }
`;

const UserName = styled.span`
  color: ${(props) => props.theme.colors.primary};
  font-weight: 600;
  cursor: default;
  padding: 8px 12px;
`;

const ToggleButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 25px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;

  .bar {
    height: 2px;
    width: 100%;
    background-color: #fff;
    border-radius: 10px;
  }

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    display: flex;
  }
`;

function Navbar() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("riftbound_user"));

  const handleLogout = () => {
    localStorage.removeItem("riftbound_user");
    navigate("/");
    window.location.reload();
  };

  const handleCreateDeck = async () => {
    if (!user) {
      showToast("Please login to create a deck", "info");
      navigate("/login");
      setIsMenuOpen(false);
      return;
    }

    try {
      const defaultName = "New Deck";
      const data = await api.createDeck(defaultName, user?.id);

      if (data && data.id) {
        navigate(`/edit/${data.id}`);
        setIsMenuOpen(false);
      }
    } catch (err) {
      console.error("Error creating deck:", err);
      showToast("Failed to create deck. Please try again.", "error");
    }
  };

  return (
    <Nav>
      <NavContainer>
        <Logo to="/" onClick={() => setIsMenuOpen(false)}>
          RIFTBUILDER
        </Logo>

        <NavLinks isOpen={isMenuOpen}>
          <NavItem to="/decks" onClick={() => setIsMenuOpen(false)}>
            Deck Gallery
          </NavItem>
          <NavItem to="/my-decks" onClick={() => setIsMenuOpen(false)}>
            My Decks
          </NavItem>
          <NavButton onClick={handleCreateDeck}>Create Deck</NavButton>
          <Divider />

          {user ? (
            <>
              <UserName>Hi, {user.username}</UserName>
              <LogoutBtn onClick={handleLogout}>Logout</LogoutBtn>
            </>
          ) : (
            <>
              <AuthBtn
                to="/login"
                className="login"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </AuthBtn>
              <AuthBtn
                to="/register"
                className="register"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </AuthBtn>
            </>
          )}
        </NavLinks>

        <ToggleButton
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </ToggleButton>
      </NavContainer>
    </Nav>
  );
}

export default Navbar;
