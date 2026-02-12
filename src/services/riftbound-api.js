const API_URL = "http://localhost:3001/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`,
    );
  }
  return response.json();
};

export const fetchCards = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `${API_URL}/cards?${queryString}`
      : `${API_URL}/cards`;

    const result = await handleResponse(await fetch(url));
    return { cards: result.data, pagination: result.pagination };
  } catch (error) {
    console.error("Error fetching cards:", error);
    return { cards: [], pagination: {} };
  }
};

export const fetchRandomCards = async (count = 4) => {
  try {
    return await handleResponse(
      await fetch(`${API_URL}/cards/random?count=${count}`),
    );
  } catch (error) {
    console.error("Error fetching random cards:", error);
    return [];
  }
};

export const fetchDomains = async () => {
  try {
    return await handleResponse(await fetch(`${API_URL}/domains`));
  } catch (error) {
    console.error("Error fetching domains:", error);
    return [];
  }
};

export const fetchLatestDecks = async () => {
  try {
    return await handleResponse(await fetch(`${API_URL}/latest-decks`));
  } catch (error) {
    console.error("Error fetching latest decks:", error);
    return [];
  }
};

export const fetchDecks = async (userId = null) => {
  try {
    const url = userId
      ? `${API_URL}/decks?userId=${userId}`
      : `${API_URL}/decks`;
    return await handleResponse(await fetch(url));
  } catch (error) {
    console.error("Error fetching decks:", error);
    return [];
  }
};

export const fetchDeck = async (deckId, userId = null) => {
  try {
    const url = userId
      ? `${API_URL}/decks/${deckId}?userId=${userId}`
      : `${API_URL}/decks/${deckId}`;
    return await handleResponse(await fetch(url));
  } catch (error) {
    console.error("Error fetching deck:", error);
    return null;
  }
};

export const createDeck = async (name, userId = null) => {
  try {
    return await handleResponse(
      await fetch(`${API_URL}/decks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userId }),
      }),
    );
  } catch (error) {
    console.error("Error creating deck:", error);
    return null;
  }
};

export const deleteDeck = async (deckId) => {
  try {
    const response = await fetch(`${API_URL}/decks/${deckId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting deck:", error);
    return false;
  }
};

export const updateDeck = async (deckId, data) => {
  try {
    return await handleResponse(
      await fetch(`${API_URL}/decks/${deckId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
  } catch (error) {
    console.error("Error updating deck:", error);
    return null;
  }
};

export const addCardToDeck = async (deckId, cardId, isSideboard = false) => {
  try {
    return await handleResponse(
      await fetch(`${API_URL}/decks/${deckId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, isSideboard }),
      }),
    );
  } catch (error) {
    console.error("Error adding card to deck:", error);
    return null;
  }
};

export const removeCardFromDeck = async (
  deckId,
  cardId,
  isSideboard = false,
) => {
  try {
    const query = isSideboard ? `?isSideboard=true` : "";
    return await handleResponse(
      await fetch(`${API_URL}/decks/${deckId}/cards/${cardId}${query}`, {
        method: "DELETE",
      }),
    );
  } catch (error) {
    console.error("Error removing card from deck:", error);
    return null;
  }
};

export const fetchCard = async (cardId) => {
  try {
    return await handleResponse(await fetch(`${API_URL}/cards/${cardId}`));
  } catch (error) {
    console.error(`Error fetching card ${cardId}:`, error);
    return null;
  }
};

export const register = async (username, password) => {
  return await handleResponse(
    await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }),
  );
};

export const login = async (username, password) => {
  return await handleResponse(
    await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }),
  );
};
