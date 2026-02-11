import { useState, useCallback, useMemo } from 'react';

const API_BASE = 'http://localhost:3001/api';

/**
 * Custom hook for managing deck state and communications
 * @param {string} initialDeckId - ID of the deck to load initially
 */
export function useDeck(initialDeckId = 1) {
    const [selectedDeck, setSelectedDeck] = useState({ id: initialDeckId, name: 'Main Deck', cards: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const deck = selectedDeck.cards;

    // Load deck from server
    const fetchSelectedDeck = useCallback(async (id = selectedDeck.id) => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/decks/${id}`);
            const data = await res.json();
            setSelectedDeck(data);
            setError(null);
        } catch (err) {
            setError('Failed to load deck');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedDeck.id]);

    const setSelectedDeckById = useCallback((id) => {
        setSelectedDeck(prev => ({ ...prev, id }));
        fetchSelectedDeck(id);
    }, [fetchSelectedDeck]);

    // Add card to deck
    const addCardToDeck = useCallback(async (deckId, cardId, isSideboard = false) => {
        try {
            await fetch(`${API_BASE}/decks/${deckId}/cards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardId, isSideboard })
            });
            await fetchSelectedDeck(deckId);
        } catch (err) {
            console.error('Error adding card:', err);
        }
    }, [fetchSelectedDeck]);

    // Remove card from deck
    const removeCardFromDeck = useCallback(async (deckId, cardId, isSideboard = false) => {
        try {
            await fetch(`${API_BASE}/decks/${deckId}/cards/${cardId}?isSideboard=${isSideboard}`, {
                method: 'DELETE'
            });
            await fetchSelectedDeck(deckId);
        } catch (err) {
            console.error('Error removing card:', err);
        }
    }, [fetchSelectedDeck]);

    // Update main champion
    const setMainChampionId = useCallback(async (deckId, mainChampionId) => {
        try {
            await fetch(`${API_BASE}/decks/${deckId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mainChampionId })
            });
            await fetchSelectedDeck(deckId);
        } catch (err) {
            console.error('Error updating main champion:', err);
        }
    }, [fetchSelectedDeck]);

    // Update deck metadata
    const updateDeckMetadata = useCallback(async (deckId, { name, description }) => {
        try {
            await fetch(`${API_BASE}/decks/${deckId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });
            await fetchSelectedDeck(deckId);
        } catch (err) {
            console.error('Error updating metadata:', err);
        }
    }, [fetchSelectedDeck]);

    // Delete deck
    const deleteDeck = useCallback(async (deckId) => {
        try {
            const res = await fetch(`${API_BASE}/decks/${deckId}`, {
                method: 'DELETE'
            });
            return res.ok;
        } catch (err) {
            console.error('Error deleting deck:', err);
            return false;
        }
    }, []);

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
        setMainChampionId
    };
}
