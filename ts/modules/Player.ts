import LoggerFactory from "../util/LoggerFactory";
import Deck from "./Deck";

export default class Player {
  private static logger = LoggerFactory.getLogger("Player");
  private name: String;
  private deck: Deck | undefined;

  constructor(name: String) {
    this.name = name;
    Player.logger.info(`Created player ${name}`);
  }

  setDeck(deck: Deck) {
    this.deck = deck;
  }
}
