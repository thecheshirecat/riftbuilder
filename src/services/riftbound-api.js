const API_URL = "http://localhost:3001/api";

export const fetchCards = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${API_URL}/cards?${queryString}` : `${API_URL}/cards`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return { cards: result.data, pagination: result.pagination };
  } catch (error) {
    console.error("Error fetching cards:", error);
    return { cards: [], pagination: {} };
  }
};

export const fetchDomains = async () => {
    try {
        const response = await fetch(`${API_URL}/domains`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching domains:", error);
        return [];
    }
};



export const fetchDecks = async () => {
  try {
    const response = await fetch(`${API_URL}/decks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching decks:", error);
    return [];
  }
};

export const createDeck = async (name) => {
  try {
    const response = await fetch(`${API_URL}/decks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating deck:", error);
    return null;
  }
};

export const addCardToDeck = async (deckId, cardId) => {
  try {
    const response = await fetch(`${API_URL}/decks/${deckId}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cardId }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error adding card to deck:", error);
    return null;
  }
};

export const removeCardFromDeck = async (deckId, cardId) => {
  try {
    const response = await fetch(`${API_URL}/decks/${deckId}/cards/${cardId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error removing card from deck:", error);
    return null;
  }
};

export const fetchDeck = async (deckId) => {
  try {
    const response = await fetch(`${API_URL}/decks/${deckId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching deck:", error);
    return [];
  }
};
export const updateDeckMainChampion = async (deckId, mainChampionId) => {
  const response = await fetch(`${API_URL}/decks/${deckId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mainChampionId }),
  });
  return response.json();
};
