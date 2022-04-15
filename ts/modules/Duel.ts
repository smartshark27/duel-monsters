import LoggerFactory from "../util/LoggerFactory";
import Deck from "./Deck";
import Player from "./Player";

export default class Duel {
  private static logger = LoggerFactory.getLogger("Duel");
  private player1: Player;
  private player2: Player;

  constructor(deck1: Deck, deck2: Deck) {
    Duel.logger.info("Created duel");

    this.player1 = new Player(deck1);
    this.player2 = new Player(deck2);
  }
}
