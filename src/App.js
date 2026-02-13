import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { theme, GlobalStyle } from "./styles/theme";
import HomePage from "./pages/HomePage/index";
import DecksGalleryPage from "./pages/DecksGalleryPage/index";
import MyDecksPage from "./pages/MyDecksPage/index";
import DeckViewPage from "./pages/ViewDeckPage/index";
import DeckEditPage from "./pages/DeckEditPage/index";
import RegisterPage from "./pages/RegisterPage/index";
import LoginPage from "./pages/LoginPage/index";
import Navbar from "./components/Navbar/index";
import { ToastProvider } from "./components/Toast/index";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <ToastProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/decks" element={<DecksGalleryPage />} />
            <Route path="/my-decks" element={<MyDecksPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/view/:deckId" element={<DeckViewPage />} />
            <Route path="/edit/:deckId" element={<DeckEditPage />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
