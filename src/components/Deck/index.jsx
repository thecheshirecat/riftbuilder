import React from "react";
import { validateDeck } from "../../utils/cardUtils";
import DeckView from "../DeckView/index";
import DeckBuilder from "../DeckBuilder/index";

/**
 * Deck Component
 * Actúa como un controlador que decide si mostrar la vista pública (DeckView)
 * o el editor (DeckBuilder), asegurando que no haya conflictos de estilos o lógica.
 */
function Deck(props) {
  const { deck, mainChampionId } = props;

  // La validación se hace una vez aquí y se pasa a los hijos
  const validation = validateDeck(deck, mainChampionId);

  if (props.isEditingMode) {
    return (
      <DeckBuilder
        {...props}
        validation={validation}
        sort={props.sort}
        order={props.order}
      />
    );
  }

  return <DeckView {...props} validation={validation} />;
}

export default Deck;
