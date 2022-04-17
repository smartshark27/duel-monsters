import { Phase, PHASE_ENUM_LENGTH } from "../enums";
import LoggerFactory from "../util/LoggerFactory";
import Util from "../util/Util";
import Action from "./actions/Action";
import Player from "./Player";

export default class Duel {
  phase = Phase.Draw;
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
    let actions = this.activePlayer.getActions();
    while (this.running) {
      while (actions.length > 0) {
        this.performRandomAction(actions);
        if (!this.running) break;
        actions = this.activePlayer.getActions();
      }
      if (!this.running) break;
      if (this.phase === Phase.End) this.switchTurns();
      this.startNextPhase();
      actions = this.activePlayer.getActions();
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

  private performRandomAction(actions: Action[]) {
    const action = Util.getRandomItemFromArray(actions);
    action.perform();
  }

  private startNextPhase() {
    this.phase = (this.phase + 1) % PHASE_ENUM_LENGTH;
    if (this.phase == Phase.Draw) {
      this.activePlayer.startDrawPhase();
    } else if (this.phase == Phase.Main1) {
      this.activePlayer.startMainPhase1();
    } else if (this.phase == Phase.Battle) {
      this.activePlayer.startBattlePhase();
    } else if (this.phase == Phase.Main2) {
      this.activePlayer.startMainPhase2();
    } else if (this.phase == Phase.End) {
      this.activePlayer.startEndPhase();
    }
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
    const loser = this.players.find((player) => player !== winner) as Player;
    Duel.logger.info(`The winner is ${winner.name}`);
    Duel.logger.info(`The loser is ${loser.name}`);
  }
}
