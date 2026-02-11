const express = require("express");
const cors = require("cors");
const { initSchema } = require("./database");
const syncCards = require("./sync_cards");
const syncDomains = require("./sync_domains");

// Import Routes
const cardRoutes = require("./routes/cards");
const deckRoutes = require("./routes/decks");

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Schema
initSchema();

// Register Routes
app.use("/api/cards", cardRoutes);
app.use("/api/decks", deckRoutes);

// Helper for domains (Legacy path sometimes used)
app.use("/api/domains", (req, res, next) => {
    req.url = "/domains";
    cardRoutes(req, res, next);
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  
  // Initial database sync
  syncDomains();
  syncCards();

  // Scheduled daily card and domain sync
  const DAILY_INTERVAL = 24 * 60 * 60 * 1000;
  setInterval(() => {
    console.log("Running scheduled daily card and domain sync...");
    syncDomains();
    syncCards();
  }, DAILY_INTERVAL);
});
