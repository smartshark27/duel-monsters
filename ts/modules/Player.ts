import LoggerFactory from "../util/LoggerFactory";
import Deck from "./Deck";

export default class Player {
  private static logger = LoggerFactory.getLogger("Player");
  private deck: Deck;

  constructor(deck: Deck) {
    this.deck = deck;

    Player.logger.info("Created player");
  }
}
