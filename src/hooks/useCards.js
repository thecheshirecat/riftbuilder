import { useState, useEffect, useRef, useCallback } from "react";
import { fetchCards, fetchDomains } from "../services/riftbound-api";

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
            const domains = await fetchDomains();
            setAvailableDomains(domains);
        } catch (e) {
            console.error("Failed to load domains", e);
        }
    };
    loadDomains();
  }, []);

  const loadCards = useCallback(
    async () => {
      try {
        setLoading(true);
        // Clean up empty filters
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => 
                v !== "" && !(Array.isArray(v) && v.length === 0)
            )
        );
        
        if (cleanFilters.domains && Array.isArray(cleanFilters.domains)) {
            cleanFilters.domains = cleanFilters.domains.join(",");
        }

        const result = await fetchCards(cleanFilters);
        setCards(result.cards);
        setPagination(result.pagination);
      } catch (error) {
        console.error("Error loading cards:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

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

  const setPage = (page) => {
      setFilters(prev => ({ ...prev, page }));
  };

  return { cards, loading, error, filters, setFilters, availableDomains, pagination, setPage };
}
