import { Phase } from "../enums";
import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";

export default class Duel {
  phase: Phase = Phase.PreGame;
  private static logger = LoggerFactory.getLogger("Duel");
  private players: Player[];
  private activePlayerIndex = 0;
  private activePlayer: Player;
  private running = false;

  constructor(players: Player[]) {
    Duel.logger.info("Creating duel");
    this.players = players;
    this.activePlayer = players[this.activePlayerIndex];
  }

  init() {
    this.players.forEach((player) => player.init());
  }

  start() {
    this.running = true;
    this.activePlayer = this.getActivePlayer();
    this.activePlayer.havingTurn = true;
    while (this.running) {
      this.activePlayer.startDrawPhase();
      this.activePlayer.startMainPhase1();
      this.activePlayer.startBattlePhase();
      this.activePlayer.startEndPhase();
      this.switchTurns();
    }
    Duel.logger.info("Game has ended");
  }

  end(winner: Player) {
    this.running = false;
    Duel.logger.info(`The winner is ${winner.name}`);
  }

  getActivePlayer() {
    return this.players[this.activePlayerIndex];
  }

  getInactivePlayer() {
    return this.players[this.getInactivePlayerIndex()];
  }

  private switchTurns() {
    this.activePlayer.havingTurn = false;
    this.activePlayerIndex = this.getInactivePlayerIndex();
    this.activePlayer = this.players[this.activePlayerIndex];
    this.activePlayer.havingTurn = true;
    Duel.logger.info(`Switched to player ${this.activePlayer.name}`);
  }

  private getInactivePlayerIndex() {
    return this.activePlayerIndex == 0 ? 1 : 0;
  }
}
