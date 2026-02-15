import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import CardList from "../../components/CardList/index";
import CardFilters from "../../components/CardFilters/index";
import Deck from "../../components/Deck/index";
import CardDetailPopup from "../../components/CardDetailPopup/index";
import { useDeck } from "../../hooks/useDeck";
import * as api from "../../services/riftbound-api";
import { useToast } from "../../components/Toast/index";
import "./DeckEditPage.scss";

/**
 * DeckEditPage - Editor interactivo de mazos.
 * Permite filtrar cartas, añadirlas al mazo/sideboard y gestionar la estructura del mazo.
 */
function DeckEditPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // -- Hook de Gestión de Mazo --
  // Lo declaramos al inicio para que esté disponible en los efectos de seguridad
  const {
    selectedDeck,
    deck,
    cardCounts,
    setSelectedDeckById,
    updateDeckMetadata,
    deleteDeck,
    addCardToDeck,
    removeCardFromDeck,
    setMainChampionId,
    addCardsToDeck,
    clearDeck,
  } = useDeck(parseInt(deckId));

  // -- Referencias para control de flujo --
  const filtersInitialized = useRef(false);
  const prevDeckLength = useRef(0);
  const hasRedirected = useRef(false);

  // -- Seguridad y Autenticación --
  const user = useMemo(() => {
    const savedUser = localStorage.getItem("riftbound_user");
    return savedUser ? JSON.parse(savedUser) : null;
  }, []); // El usuario se carga una vez al montar o si se recarga la página

  // 1. Bloqueo de acceso si no hay usuario logueado
  useEffect(() => {
    if (!user && !hasRedirected.current) {
      hasRedirected.current = true;
      showToast("Please login to edit decks", "error");
      navigate("/login");
    }
  }, [user, navigate, showToast]);

  // 2. Verificación de propiedad del mazo una vez cargado
  useEffect(() => {
    // Solo verificamos si el mazo ha sido cargado realmente (tiene un user_id del servidor)
    const isDeckLoaded = selectedDeck && selectedDeck.user_id !== undefined;

    if (
      isDeckLoaded &&
      user &&
      selectedDeck.user_id !== user.id &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      showToast("You don't have permission to edit this deck.", "error");
      navigate(`/view/${deckId}`);
    }
  }, [selectedDeck, user, navigate, showToast, deckId]);

  // -- Estado Local --
  const [cards, setCards] = useState([]);
  const [availableDomains, setAvailableDomains] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1 });
  const [selectedCard, setSelectedCard] = useState(null);

  // El editor siempre utiliza la vista de cuadrícula para las cartas disponibles
  const viewMode = "grid";
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(max-width: 480px)").matches;
    }
    return false;
  });
  const [mobileColumnView, setMobileColumnView] = useState("left");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 480px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // -- Configuración de Filtros --
  const [filters, setFilters] = useState({
    q: "",
    domains: [],
    type: "Legend", // Por defecto empezamos buscando la Legend
    activeSection: "legend",
    rarity: "",
    energy_min: 0,
    energy_max: 12,
    power_min: 0,
    power_max: 4,
    might_min: 0,
    might_max: 12,
    sort: "name",
    order: "ASC",
    page: 1,
    isSideboardContext: false,
  });

  // 1. Cargar dominios disponibles al montar
  useEffect(() => {
    // Evitar llamadas si no hay usuario o si ya se ha decidido redirigir
    if (!user || hasRedirected.current) return;

    const loadDomains = async () => {
      try {
        const domains = await api.fetchDomains();
        setAvailableDomains(domains);
      } catch (err) {
        console.error("Error loading domains:", err);
      }
    };
    loadDomains();
  }, [user]);

  // 2. Sincronizar el ID del mazo con el hook
  useEffect(() => {
    // Evitar llamadas si no hay usuario o si ya se ha decidido redirigir
    if (deckId && user && !hasRedirected.current) {
      setSelectedDeckById(parseInt(deckId));
    }
  }, [deckId, setSelectedDeckById, user]);

  // 3. Inicialización inteligente de filtros basada en el estado actual del mazo
  useEffect(() => {
    // Solo inicializamos si somos el dueño y no estamos redirigiendo
    const isOwner =
      selectedDeck &&
      selectedDeck.user_id !== undefined &&
      user &&
      selectedDeck.user_id === user.id;
    if (!isOwner || hasRedirected.current) return;

    if (selectedDeck && !filtersInitialized.current && deck.length > 0) {
      const hasLegend = deck.some(
        (c) => c.type === "Legend" && !c.is_sideboard,
      );
      const battlefieldsCount = deck.filter(
        (c) => c.type === "Battlefield" && !c.is_sideboard,
      ).length;

      if (!hasLegend) {
        setFilters((prev) => ({
          ...prev,
          type: "Legend",
          activeSection: "legend",
        }));
      } else if (battlefieldsCount < 3) {
        setFilters((prev) => ({
          ...prev,
          type: "Battlefield",
          activeSection: "battlefield",
        }));
      } else {
        setFilters((prev) => ({
          ...prev,
          type: "Unit,Spell,Gear,Champion",
          activeSection: "main",
        }));
      }
      filtersInitialized.current = true;
    }
  }, [selectedDeck, deck.length]);

  // 4. Lógica de auto-avance: cambia automáticamente de sección al completar requisitos
  useEffect(() => {
    // Solo auto-avanzar si somos el dueño y no estamos redirigiendo
    const isOwner =
      selectedDeck &&
      selectedDeck.user_id !== undefined &&
      user &&
      selectedDeck.user_id === user.id;
    if (!isOwner || hasRedirected.current) return;

    const isAddingCard = deck.length > prevDeckLength.current;
    prevDeckLength.current = deck.length;

    if (!selectedDeck || !filtersInitialized.current || !isAddingCard) return;

    const hasLegend = deck.some((c) => c.type === "Legend" && !c.is_sideboard);
    const battlefieldsCount = deck.filter(
      (c) => c.type === "Battlefield" && !c.is_sideboard,
    ).length;

    if (
      hasLegend &&
      filters.type === "Legend" &&
      filters.activeSection === "legend"
    ) {
      setFilters((prev) => ({
        ...prev,
        activeSection: battlefieldsCount < 3 ? "battlefield" : "main",
        type:
          battlefieldsCount < 3 ? "Battlefield" : "Unit,Spell,Gear,Champion",
      }));
    } else if (
      battlefieldsCount === 3 &&
      filters.type === "Battlefield" &&
      filters.activeSection === "battlefield"
    ) {
      setFilters((prev) => ({
        ...prev,
        activeSection: "main",
        type: "Unit,Spell,Gear,Champion",
      }));
    }
  }, [deck.length, selectedDeck, filters.type, filters.activeSection]);

  /**
   * Cambia la sección activa del editor y ajusta los filtros de tipo correspondientes.
   */
  const handleSectionClick = useCallback((sectionType) => {
    setFilters((prev) => {
      const baseFilters = {
        ...prev,
        q: "",
        energy_min: 0,
        energy_max: 12,
        power_min: 0,
        power_max: 4,
        might_min: 0,
        might_max: 12,
        page: 1,
        isSideboardContext: sectionType === "sideboard",
        activeSection: sectionType,
      };

      switch (sectionType) {
        case "legend":
          return { ...baseFilters, type: "Legend" };
        case "battlefield":
          return { ...baseFilters, type: "Battlefield" };
        case "main":
          return { ...baseFilters, type: "Unit,Spell,Gear,Champion" };
        case "runes":
          return { ...baseFilters, type: "Rune" };
        case "sideboard":
          return { ...baseFilters, type: "Unit,Spell,Gear,Champion,Rune" };
        default:
          return baseFilters;
      }
    });
  }, []);

  /**
   * Obtiene las cartas de la API basándose en los filtros actuales.
   */
  const fetchCards = useCallback(async () => {
    try {
      const currentLegend = deck.find(
        (c) => c.type === "Legend" && !c.is_sideboard,
      );

      const params = {
        ...filters,
        legendTags: currentLegend?.tags || "",
        domains: filters.domains?.join(",") || "",
      };

      // Limpieza de parámetros para mantener la URL limpia
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === undefined ||
          params[key] === null
        ) {
          delete params[key];
        }
      });

      const result = await api.fetchCards(params);
      setCards(result.cards);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Error fetching cards:", err);
    }
  }, [filters, deck]);

  // Sincronizar búsqueda de cartas con cambios en filtros
  useEffect(() => {
    // Solo buscamos cartas si el usuario está logueado, es dueño del mazo y no estamos redirigiendo
    const isOwner =
      selectedDeck &&
      selectedDeck.user_id !== undefined &&
      user &&
      selectedDeck.user_id === user.id;

    if (user && isOwner && !hasRedirected.current) {
      fetchCards();
    }
  }, [fetchCards, user, selectedDeck?.user_id]);

  /**
   * Gestiona la adición de una carta al mazo con validaciones de reglas de juego.
   */
  const handleAddCardToDeck = async (card, isSideboard = false) => {
    const targetIsSideboard = filters.isSideboardContext || isSideboard;
    const currentGlobalCopies = cardCounts[card.name] || 0;

    // -- Validaciones Globales --
    if (card.type === "Legend" && currentGlobalCopies >= 1) {
      showToast("You can only have 1 copy of a Legend.", "error");
      return;
    }

    if (
      card.type !== "Rune" &&
      card.type !== "Legend" &&
      card.type !== "Battlefield" &&
      currentGlobalCopies >= 3
    ) {
      showToast(
        `You cannot have more than 3 copies of '${card.name}' in total.`,
        "error",
      );
      return;
    }

    // -- Lógica para Sideboard --
    if (targetIsSideboard) {
      if (card.type === "Battlefield" || card.type === "Legend") {
        showToast(`${card.type}s cannot be added to the sideboard.`, "error");
        return;
      }
      const sideboardCount = deck.filter((c) => c.is_sideboard).length;
      if (sideboardCount >= 8) {
        showToast("Sideboard is full (max 8 cards).", "error");
        return;
      }
      await addCardToDeck(selectedDeck.id, card.id, true);
    }
    // -- Lógica para Mazo Principal --
    else {
      if (card.type === "Legend") {
        const legend = deck.find((c) => c.type === "Legend" && !c.is_sideboard);
        // Reemplazar Legend existente si hay una
        if (legend) await removeCardFromDeck(selectedDeck.id, legend.id, false);
        await addCardToDeck(selectedDeck.id, card.id, false);
      } else if (card.type === "Battlefield") {
        const count = deck.filter(
          (c) => c.type === "Battlefield" && !c.is_sideboard,
        ).length;
        if (count < 3) await addCardToDeck(selectedDeck.id, card.id, false);
        else showToast("You can only have 3 Battlefields.", "error");
      } else if (card.type === "Rune") {
        const count = deck.filter(
          (c) => c.type === "Rune" && !c.is_sideboard,
        ).length;
        if (count < 12) await addCardToDeck(selectedDeck.id, card.id, false);
        else showToast("You can only have 12 Runes.", "error");
      } else {
        const mainDeckCount = deck.filter(
          (c) =>
            !["Legend", "Battlefield", "Rune"].includes(c.type) &&
            !c.is_sideboard,
        ).length;
        if (mainDeckCount < 40)
          await addCardToDeck(selectedDeck.id, card.id, false);
        else showToast("Main deck is full (max 40 cards).", "error");
      }
    }
  };

  /**
   * Elimina el mazo tras confirmación del usuario.
   */
  const handleDeleteDeck = async (id) => {
    if (window.confirm("Are you certain you want to delete this deck?")) {
      if (await deleteDeck(id)) navigate("/");
    }
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  /**
   * Importa un mazo desde un texto copiado (formato "cantidadx Nombre")
   */
  const handleImportDeck = async () => {
    const text = await navigator.clipboard.readText();
    if (!text) {
      showToast("Clipboard is empty", "error");
      return;
    }

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== "");
    if (lines.length === 0) {
      showToast("No cards found in clipboard", "error");
      return;
    }

    showToast("Importing deck...", "info");

    try {
      // 1. Limpiar el mazo actual primero
      await clearDeck(selectedDeck.id);

      let isSideboardContext = false;
      const cardsToImport = [];
      let importedChampionId = null;
      const failedCards = [];

      for (const line of lines) {
        if (line.toLowerCase().includes("sideboard:")) {
          isSideboardContext = true;
          continue;
        }

        // Soportar "1x Nombre" o simplemente "Nombre" (asumiendo 1x)
        let qty = 1;
        let cardName = line;

        const match = line.match(/^(\d+)x\s+(.+)$/i);
        if (match) {
          qty = parseInt(match[1]);
          cardName = match[2].trim();
        }

        // Buscar la carta en la base de datos por nombre
        // Limpieza extra para nombres con comas o caracteres especiales
        const cleanName = cardName.trim();
        const searchResult = await api.fetchCards({ q: cleanName, limit: 10 });

        // Intento de coincidencia exacta (case-insensitive)
        let card = searchResult.cards.find(
          (c) => c.name.toLowerCase() === cleanName.toLowerCase(),
        );

        // Si no hay coincidencia exacta, probar a buscar coincidencias parciales inteligentes
        if (!card) {
          // 1. Probar si el nombre buscado es parte de un nombre más largo (ej: "Dark Child" -> "Dark Child - Starter")
          card = searchResult.cards.find((c) =>
            c.name.toLowerCase().includes(cleanName.toLowerCase()),
          );

          // 2. Si sigue sin haber, y tiene coma, probar la parte antes de la primera coma
          if (!card && cleanName.includes(",")) {
            const firstPart = cleanName.split(",")[0].trim();
            card = searchResult.cards.find((c) =>
              c.name.toLowerCase().startsWith(firstPart.toLowerCase()),
            );
          }
        }

        if (card) {
          // Si es un Campeón (qty 1 y no es sideboard)
          if (
            qty === 1 &&
            !isSideboardContext &&
            card.type === "Champion" &&
            !importedChampionId
          ) {
            importedChampionId = card.id;
          }

          for (let i = 0; i < qty; i++) {
            cardsToImport.push({
              cardId: card.id,
              isSideboard: isSideboardContext,
            });
          }
        } else {
          failedCards.push(cardName);
          console.warn(`Card not found: ${cardName}`);
        }
      }

      if (cardsToImport.length > 0) {
        await addCardsToDeck(selectedDeck.id, cardsToImport);

        // Si detectamos un campeón, establecerlo como principal
        if (importedChampionId) {
          await setMainChampionId(selectedDeck.id, importedChampionId);
        }

        if (failedCards.length > 0) {
          showToast(
            `Imported with issues. Missing: ${failedCards.join(", ")}`,
            "warning",
          );
        } else {
          showToast("Deck imported successfully!", "success");
        }
      } else {
        showToast("No valid cards found to import", "warning");
      }
    } catch (err) {
      console.error("Error importing deck:", err);
      showToast("Failed to import deck", "error");
    }
  };

  // Si no hay usuario, mostramos un estado de carga mientras redirigimos
  if (!user) {
    return (
      <div className="deck-edit-page">
        <div className="loading">Redirecting to login...</div>
      </div>
    );
  }

  // Si el mazo no pertenece al usuario, mostramos carga mientras redirigimos a la vista
  // Importante: Solo bloqueamos el renderizado si el mazo YA se ha cargado y hemos confirmado que NO es del usuario
  if (
    selectedDeck &&
    selectedDeck.user_id !== undefined &&
    user &&
    selectedDeck.user_id !== user.id
  ) {
    return (
      <div className="deck-edit-page">
        <div className="loading">Redirecting to view mode...</div>
      </div>
    );
  }

  if (!selectedDeck) {
    return (
      <div className="deck-edit-page">
        <div className="loading">Loading deck...</div>
      </div>
    );
  }

  return (
    <div className="deck-edit-page">
      <main className="deck-edit-main">
        <div className="content-grid">
          <section
            className={
              "card-list-section " +
              (isMobile && mobileColumnView === "right" ? "deck-sticky" : "")
            }
          >
            <CardFilters
              filters={filters}
              setFilters={setFilters}
              availableDomains={availableDomains}
              viewMode={viewMode}
              setViewMode={() => {}}
              isMobile={isMobile}
              mobileColumnView={mobileColumnView}
              setMobileColumnView={setMobileColumnView}
            />
            {!(isMobile && mobileColumnView === "right") && (
              <CardList
                cards={cards}
                pagination={pagination}
                setPage={handlePageChange}
                setSelectedCard={setSelectedCard}
                addCardToDeck={handleAddCardToDeck}
                removeCardFromDeck={(cardId) =>
                  removeCardFromDeck(selectedDeck.id, cardId)
                }
                cardCounts={cardCounts}
                viewMode={viewMode}
              />
            )}
          </section>

          {!(isMobile && mobileColumnView === "left") && (
            <section className="deck-section">
              <Deck
                selectedDeck={selectedDeck}
                deck={deck}
                removeCardFromDeck={(id, isSb) =>
                  removeCardFromDeck(selectedDeck.id, id, isSb)
                }
                addCardToDeck={handleAddCardToDeck}
                mainChampionId={selectedDeck.main_champion_id}
                setMainChampionId={setMainChampionId}
                updateDeckMetadata={updateDeckMetadata}
                onDeleteDeck={handleDeleteDeck}
                isEditingMode={true}
                setIsEditingMode={() => navigate(`/view/${deckId}`)}
                viewMode={viewMode}
                setSelectedCard={setSelectedCard}
                onSectionClick={handleSectionClick}
                onImportDeck={handleImportDeck}
                activeSection={filters.activeSection}
                sort={filters.sort}
                order={filters.order}
              />
            </section>
          )}
        </div>
      </main>

      {selectedCard && (
        <CardDetailPopup
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onAdd={handleAddCardToDeck}
        />
      )}
    </div>
  );
}

export default DeckEditPage;
