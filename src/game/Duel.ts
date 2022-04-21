import { Phase, PHASE_ENUM_LENGTH } from "../enums";
import LoggerFactory from "../util/LoggerFactory";
import Action from "./Action";
import Player from "./Player";

export default class Duel {
  phase = Phase.Main1;
  running = false;
  turnCounter = 0;
  private static logger = LoggerFactory.getLogger("Duel");
  private activePlayer: Player;
  private winner: Player | undefined;

  constructor(private players: Player[]) {
    Duel.logger.info("Creating duel");
    this.activePlayer = players[0];
    this.players.forEach((player) => player.init());
    this.activePlayer = this.getActivePlayer();
    this.activePlayer.havingTurn = true;
    this.running = true;
    this.activePlayer.startMainPhase1();
  }

  getActions(): Action[] {
    const actionSelection = this.activePlayer.actionSelection;
    if (actionSelection.length > 0) {
      this.activePlayer.actionSelection = [];
      return actionSelection;
    }
    return this.activePlayer.getActions();
  }

  performAction(action: Action) {
    action.perform();
  }

  switchTurns() {
    this.turnCounter++;
    this.activePlayer.havingTurn = false;
    this.activePlayer = this.getOpponentOf(this.activePlayer);
    this.activePlayer.havingTurn = true;
    Duel.logger.info(`Switched to player ${this.activePlayer}`);
  }

  startNextPhase() {
    if (global.DUEL.phase === Phase.End) global.DUEL.switchTurns();

    // Initial turn has less phases
    this.phase =
      this.turnCounter === 0 && this.phase === Phase.Main1
        ? Phase.End
        : (this.phase + 1) % PHASE_ENUM_LENGTH;

    if (this.phase == Phase.Draw) {
      this.activePlayer.startDrawPhase();
    } else if (this.phase == Phase.Main1) {
      this.activePlayer.startMainPhase1();
    } else if (this.phase == Phase.Battle) {
      this.activePlayer.startBattlePhase();
    } else if (this.phase == Phase.Main2) {
      this.activePlayer.startMainPhase2();
    } else {
      this.activePlayer.startEndPhase();
    }
  }

  end(winner: Player) {
    this.winner = winner;
    this.running = false;
  }

  getActivePlayer() {
    return this.activePlayer;
  }

  getOpponentOf(player: Player): Player {
    return this.players.indexOf(player) === 0 ? this.players[1] : this.players[0];
  }

  printResults() {
    Duel.logger.info("Game has ended");
    const winner = this.winner as Player;
    const loser = this.players.find((player) => player !== winner) as Player;
    Duel.logger.info(`The winner is ${winner}`);
    Duel.logger.info(`The loser is ${loser}`);
  }

  toString() {
    return (
      "\n" +
      this.players[0].getFieldString() +
      "\n" +
      this.players[1].getFieldString()
    );
  }
}
