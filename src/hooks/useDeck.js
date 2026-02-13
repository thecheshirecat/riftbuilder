import { useState, useCallback, useMemo } from "react";
import * as api from "../services/riftbound-api";

/**
 * Custom hook for managing deck state and communications
 * @param {string} initialDeckId - ID of the deck to load initially
 */
export function useDeck(initialDeckId = 1) {
  const [selectedDeck, setSelectedDeck] = useState({
    id: initialDeckId,
    name: "Main Deck",
    cards: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const deck = selectedDeck.cards;

  // Load deck from server
  const fetchSelectedDeck = useCallback(
    async (id = selectedDeck.id) => {
      setIsLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("riftbound_user"));
        const data = await api.fetchDeck(id, user?.id);
        if (data && !data.error) {
          setSelectedDeck(data);
          setError(null);
        } else if (data && data.error) {
          setError(data.error);
        } else {
          setError("Failed to load deck");
        }
      } catch (err) {
        // Si el error viene de handleResponse como una excepción con el mensaje del JSON
        const errorMessage = err.message || "Failed to load deck";
        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDeck.id],
  );

  const setSelectedDeckById = useCallback(
    (id) => {
      setSelectedDeck((prev) => ({ ...prev, id }));
      fetchSelectedDeck(id);
    },
    [fetchSelectedDeck],
  );

  // Add card to deck
  const addCardToDeck = useCallback(
    async (deckId, cardId, isSideboard = false) => {
      try {
        await api.addCardToDeck(deckId, cardId, isSideboard);
        await fetchSelectedDeck(deckId);
      } catch (err) {
        console.error("Error adding card:", err);
      }
    },
    [fetchSelectedDeck],
  );

  // Remove card from deck
  const removeCardFromDeck = useCallback(
    async (deckId, cardId, isSideboard = false) => {
      try {
        await api.removeCardFromDeck(deckId, cardId, isSideboard);
        await fetchSelectedDeck(deckId);
      } catch (err) {
        console.error("Error removing card:", err);
      }
    },
    [fetchSelectedDeck],
  );

  // Update main champion
  const setMainChampionId = useCallback(
    async (deckId, mainChampionId) => {
      try {
        await api.updateDeck(deckId, { mainChampionId });
        await fetchSelectedDeck(deckId);
      } catch (err) {
        console.error("Error updating main champion:", err);
      }
    },
    [fetchSelectedDeck],
  );

  // Update deck metadata
  const updateDeckMetadata = useCallback(
    async (deckId, { name, description, visibility, is_valid }) => {
      try {
        await api.updateDeck(deckId, {
          name,
          description,
          visibility,
          is_valid,
        });
        await fetchSelectedDeck(deckId);
      } catch (err) {
        console.error("Error updating metadata:", err);
      }
    },
    [fetchSelectedDeck],
  );

  // Delete deck
  const deleteDeck = useCallback(async (deckId) => {
    try {
      return await api.deleteDeck(deckId);
    } catch (err) {
      console.error("Error deleting deck:", err);
      return false;
    }
  }, []);

  // Bulk add cards to deck
  const addCardsToDeck = useCallback(
    async (deckId, cardIdsWithSideboard) => {
      try {
        // En un entorno ideal, haríamos una sola llamada al API.
        // Como el API actual es individual, lo hacemos en serie por ahora para asegurar integridad.
        for (const { cardId, isSideboard } of cardIdsWithSideboard) {
          await api.addCardToDeck(deckId, cardId, isSideboard);
        }
        await fetchSelectedDeck(deckId);
      } catch (err) {
        console.error("Error bulk adding cards:", err);
      }
    },
    [fetchSelectedDeck],
  );

  // Clear all cards from deck
  const clearDeck = useCallback(
    async (deckId) => {
      try {
        // Obtenemos las cartas actuales para saber qué borrar
        // El API no tiene un "borrar todo", así que borramos una a una (o podrías añadir un endpoint en el futuro)
        // Por simplicidad y sin tocar el server por ahora:
        const currentCards = selectedDeck.cards;
        for (const card of currentCards) {
          await api.removeCardFromDeck(deckId, card.id, card.is_sideboard);
        }
        await fetchSelectedDeck(deckId);
      } catch (err) {
        console.error("Error clearing deck:", err);
      }
    },
    [selectedDeck.cards, fetchSelectedDeck],
  );

  // Derived: Card counts by name (for UI limits and indicators)
  const cardCounts = useMemo(() => {
    return deck.reduce((acc, card) => {
      acc[card.name] = (acc[card.name] || 0) + 1;
      return acc;
    }, {});
  }, [deck]);

  return {
    selectedDeck,
    deck,
    cardCounts,
    isLoading,
    error,
    fetchSelectedDeck,
    setSelectedDeckById,
    updateDeckMetadata,
    deleteDeck,
    addCardToDeck,
    removeCardFromDeck,
    setMainChampionId,
    addCardsToDeck,
    clearDeck,
  };
}
