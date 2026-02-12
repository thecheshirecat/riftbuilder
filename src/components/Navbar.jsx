import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as api from "../services/riftbound-api";
import { useToast } from "./Toast";
import "./Navbar.css";

function Navbar() {
  // -- Hooks y Estado --
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Obtención del usuario desde el almacenamiento local para persistencia de sesión
  const user = JSON.parse(localStorage.getItem("riftbound_user"));

  // -- Handlers --
  /**
   * Cierra la sesión del usuario eliminando sus datos del localStorage
   */
  const handleLogout = () => {
    localStorage.removeItem("riftbound_user");
    navigate("/");
    window.location.reload(); // Recarga para limpiar estados globales
  };

  /**
   * Lógica para la creación de un nuevo mazo.
   * Requiere autenticación y solicita un nombre al usuario.
   */
  const handleCreateDeck = async () => {
    if (!user) {
      showToast("Please login to create a deck", "info");
      navigate("/login");
      setIsMenuOpen(false);
      return;
    }

    const name = prompt("Enter deck name:");
    if (!name || !name.trim()) return;

    try {
      const data = await api.createDeck(name, user?.id);
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
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo / Link a Inicio */}
        <Link
          to="/"
          className="navbar-logo"
          onClick={() => setIsMenuOpen(false)}
        >
          RIFTBUILDER
        </Link>

        {/* Enlaces de Navegación (con clase active para menú móvil) */}
        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/my-decks" className="nav-item" onClick={() => setIsMenuOpen(false)}>
            My Decks
          </Link>
          <button className="nav-item btn-link" onClick={handleCreateDeck}>
            Create Deck
          </button>
          <div className="nav-divider"></div>

          {/* Sección de Autenticación / Usuario */}
          {user ? (
            <>
              <span className="nav-item user-name">Hi, {user.username}</span>
              <button
                className="nav-item auth-btn login"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="nav-item auth-btn login"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="nav-item auth-btn register"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Botón Hamburguesa para Móvil */}
        <button
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
