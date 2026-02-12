import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MyDecksPage from "./pages/MyDecksPage";
import DeckViewPage from "./pages/DeckViewPage";
import DeckEditPage from "./pages/DeckEditPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import { ToastProvider } from "./components/Toast";
import "./App.css";

function App() {
  return (
    <ToastProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/my-decks" element={<MyDecksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/view/:deckId" element={<DeckViewPage />} />
          <Route path="/edit/:deckId" element={<DeckEditPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
