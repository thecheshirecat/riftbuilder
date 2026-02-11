import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DeckViewPage from './pages/DeckViewPage';
import DeckEditPage from './pages/DeckEditPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/view/:deckId" element={<DeckViewPage />} />
        <Route path="/edit/:deckId" element={<DeckEditPage />} />
      </Routes>
    </Router>
  );
}

export default App;
