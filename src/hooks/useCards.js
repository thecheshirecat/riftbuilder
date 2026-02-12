import { useState, useEffect, useRef, useCallback } from "react";
import * as api from "../services/riftbound-api";

export function useCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, total: 0, pages: 1 });
  
  const [filters, setFilters] = useState({
    q: "",
    domains: [],
    energy_min: "", energy_max: "",
    power_min: "", power_max: "",
    might_min: "", might_max: "",
    sort: "name",
    order: "ASC",
    page: 1
  });

  const [availableDomains, setAvailableDomains] = useState([]);
  const isInitialMount = useRef(true);

  // Load available domains on mount
  useEffect(() => {
    const loadDomains = async () => {
      try {
        const domains = await api.fetchDomains();
        setAvailableDomains(domains);
      } catch (e) {
        console.error("Failed to load domains", e);
      }
    };
    loadDomains();
  }, []);

  const loadCards = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      
      const params = { ...currentFilters };
      
      // Clean up filters
      Object.keys(params).forEach(key => {
        const val = params[key];
        if (val === "" || val === null || val === undefined || (Array.isArray(val) && val.length === 0)) {
          delete params[key];
        }
      });

      if (params.domains && Array.isArray(params.domains)) {
        params.domains = params.domains.join(",");
      }

      const result = await api.fetchCards(params);
      setCards(result.cards || []);
      setPagination(result.pagination || { current: 1, total: 0, pages: 1 });
      setError(null);
    } catch (err) {
      console.error("Error loading cards:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadCards();
      return;
    }
    const t = setTimeout(() => {
      loadCards();
    }, 500);
    return () => clearTimeout(t);
  }, [filters, loadCards]);

  const setPage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    loadCards();
  }, [loadCards]);

  return { 
    cards, 
    loading, 
    error, 
    filters, 
    setFilters, 
    availableDomains, 
    pagination, 
    setPage,
    refresh 
  };
}
