const express = require("express");
const router = express.Router();
const { db } = require("../database");

// Get all decks
router.get("/", (req, res) => {
  const sql = "SELECT * FROM decks";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Create a new deck
router.post("/", (req, res) => {
  const { name } = req.body;
  const sql = "INSERT INTO decks (name) VALUES (?)";
  db.run(sql, [name], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

// Get a specific deck with its cards
router.get("/:deckId", (req, res) => {
  const { deckId } = req.params;

  const deckSql = "SELECT * FROM decks WHERE id = ?";
  db.get(deckSql, [deckId], (err, deck) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!deck) return res.status(404).json({ error: "Deck not found" });

    const cardsSql = `SELECT c.*, dc.is_sideboard FROM cards c
                     JOIN deck_cards dc ON c.id = dc.card_id
                     WHERE dc.deck_id = ?`;
    db.all(cardsSql, [deckId], (err, cards) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ ...deck, cards });
    });
  });
});

// Update deck metadata
router.patch("/:deckId", (req, res) => {
  const { deckId } = req.params;
  const { name, description, mainChampionId } = req.body;

  if (mainChampionId !== undefined) {
    db.run(
      "UPDATE decks SET main_champion_id = ? WHERE id = ?",
      [mainChampionId, deckId],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      },
    );
  } else {
    const sql = "UPDATE decks SET name = ?, description = ? WHERE id = ?";
    db.run(sql, [name, description, deckId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    });
  }
});

// Add a card to a deck
router.post("/:deckId/cards", (req, res) => {
  const { cardId, isSideboard } = req.body;
  const { deckId } = req.params;
  const sql =
    "INSERT INTO deck_cards (deck_id, card_id, is_sideboard) VALUES (?, ?, ?)";
  db.run(sql, [deckId, cardId, isSideboard ? 1 : 0], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// Remove a card from a deck
router.delete("/:deckId/cards/:cardId", (req, res) => {
  const { deckId, cardId } = req.params;
  const { isSideboard } = req.query; // Use query param to distinguish

  const sql = `DELETE FROM deck_cards 
               WHERE id = (
                 SELECT id FROM deck_cards 
                 WHERE deck_id = ? AND card_id = ? AND is_sideboard = ? 
                 LIMIT 1
               )`;

  db.run(sql, [deckId, cardId, isSideboard === "true" ? 1 : 0], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, removedCount: this.changes });
  });
});

// Delete a deck and its associations
router.delete("/:deckId", (req, res) => {
  const { deckId } = req.params;

  // First delete associated cards
  db.run("DELETE FROM deck_cards WHERE deck_id = ?", [deckId], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    // Then delete the deck itself
    db.run("DELETE FROM decks WHERE id = ?", [deckId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, deletedCount: this.changes });
    });
  });
});

module.exports = router;
