const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
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

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

  // Initial database sync on startup
  fullSync();

  // Scheduled daily card and domain sync at 00:00
  cron.schedule("0 0 * * *", () => {
    console.log("Running scheduled daily card and domain sync at 00:00...");
    fullSync();
  });
});
