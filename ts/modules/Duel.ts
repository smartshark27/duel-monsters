import LoggerFactory from "../util/LoggerFactory";
import Deck from "./Deck";

export default class Duel {
  private static logger = LoggerFactory.getLogger("Duel");
  private deck1: Deck;
  private deck2: Deck;

  constructor(deck1: Deck, deck2: Deck) {
    Duel.logger.info("Created duel");

    this.deck1 = deck1;
    this.deck2 = deck2;
  }
}
