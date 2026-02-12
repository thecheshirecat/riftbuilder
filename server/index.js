const express = require("express");
const cors = require("cors");
const { initSchema } = require("./database");
const { fullSync } = require("./scripts/sync");

// Import Unified Routes
const apiRoutes = require("./routes/api");

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database Schema
initSchema();

// Register Unified API Routes
app.use("/api", apiRoutes);

// The /api/domains route is now handled directly inside cardRoutes
// and we can remove the legacy redirect logic that was here.

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

  // Initial database sync
  fullSync();

  // Scheduled daily card and domain sync
  const DAILY_INTERVAL = 24 * 60 * 60 * 1000;
  setInterval(() => {
    console.log("Running scheduled daily card and domain sync...");
    fullSync();
  }, DAILY_INTERVAL);
});
