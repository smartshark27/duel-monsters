import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";

export default class Duel {
  private static logger = LoggerFactory.getLogger("Duel");
  private player1: Player;
  private player2: Player;

  constructor(player1: Player, player2: Player) {
    Duel.logger.info("Creating duel");

    this.player1 = player1;
    this.player2 = player2;
  }
}
