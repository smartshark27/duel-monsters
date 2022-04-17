import { Phase } from "../enums";
import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";

export default class Duel {
  phase = Phase.PreGame;
  running = false;
  private static logger = LoggerFactory.getLogger("Duel");
  private activePlayerIndex = 0;
  private activePlayer: Player;
  private winner: Player | undefined;

  constructor(private players: Player[]) {
    Duel.logger.info("Creating duel");
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
      if (!this.running) break;
      this.activePlayer.startMainPhase1();
      if (!this.running) break;
      this.activePlayer.startBattlePhase();
      if (!this.running) break;
      this.activePlayer.startEndPhase();
      if (!this.running) break;
      this.switchTurns();
    }
    this.printResults();
  }

  end(winner: Player) {
    this.winner = winner;
    this.running = false;
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

  private printResults() {
    Duel.logger.info("Game has ended");
    const winner = this.winner as Player;
    const loser = this.players.find(player => player !== winner) as Player;
    Duel.logger.info(`The winner is ${winner.name}`);
    Duel.logger.info(`The loser is ${loser.name}`);
  }
}
