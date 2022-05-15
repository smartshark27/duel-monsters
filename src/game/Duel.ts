import { Phase, PHASE_ENUM_LENGTH, State, Step, Timing } from "../enums";
import LoggerFactory from "../utils/LoggerFactory";
import Action from "./Action";
import Activation from "./actions/Activation";
import Draw from "./actions/Draw";
import ProceedPhase from "./actions/ProceedPhase";
import Pass from "./actions/Pass";
import Chain from "./Chain";
import Player from "./Player";
import ActionSelector from "./actions/ActionSelector";
import Attack from "./actions/Attack";

export default class Duel {
  actionSelection: Action[] = [];
  attack: Attack | null = null;
  chain = new Chain();
  phase = Phase.Main1;
  running = false;
  state = State.Open;
  step = Step.None;
  timing = Timing.None;
  turn = 0;
  lastAction: Action | null = null;
  private static logger = LoggerFactory.getLogger("Duel");
  private activePlayer: Player;
  private winner: Player | undefined;

  constructor(private players: Player[]) {
    Duel.logger.info("Creating duel");
    this.activePlayer = players[0];
    this.players.forEach((player) => player.init());
    this.activePlayer.havingTurn = true;
    this.running = true;
    this.activePlayer.startMainPhase1();
  }

  performAction(action?: Action): Action[] {
    if (action) {
      action.perform();
      if (action instanceof ActionSelector) {
        return this.getActionSelection();
      }
      if (action instanceof Attack) this.attack = action;
      this.lastAction = action;
    }

    Duel.logger.debug("Getting next actions");

    switch (this.state) {
      case State.Open:
        return this.getOpenStateActions();
      case State.Trigger:
        return this.getTriggerStateActions();
      case State.Chain:
        return this.getChainStateActions();
      case State.TurnPlayerResponse:
        return this.getTurnPlayerResponseActions();
      case State.OpponentResponse:
        return this.getOpponentResponseActions();
      case State.PassResponse:
        return this.getPassResponseActions();
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
    return this.players.indexOf(player) === 0
      ? this.players[1]
      : this.players[0];
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
      this.players[1].getFieldString() +
      "\n" +
      `Top monsters are ${this.players[0].field.getMonsters()}, Bottom monsters are ${this.players[1].field.getMonsters()}`
    );
  }

  private getActionSelection(): Action[] {
    const actionSelection = this.actionSelection;
    this.actionSelection = [];
    return actionSelection;
  }

  private getOpenStateActions(): Action[] {
    Duel.logger.debug("Checking open state actions");
    this.state = State.Open;

    if (!this.lastAction) {
      if (this.phase === Phase.Draw) return [new Draw(this.activePlayer)];
      if (this.isMultipleOpenActionState())
        return this.activePlayer.getSpeed1Actions();
      return this.getTriggerStateActions();
    }

    if (this.lastAction instanceof Activation)
      return this.getChainStateActions();
    if (this.lastAction instanceof ProceedPhase)
      return this.getPassResponseActions();
    return this.getTriggerStateActions();
  }

  private getTriggerStateActions(): Action[] {
    Duel.logger.debug("Checking trigger state actions");
    this.state = State.Trigger;
    const triggerEffectActions: Action[] = [];

    if (triggerEffectActions.length > 0) return triggerEffectActions;

    return this.getTurnPlayerResponseActions();
  }

  private getChainStateActions() {
    Duel.logger.debug("Checking chain state actions");
    this.state = State.Chain;
    if (this.lastAction instanceof Pass) {
      this.chain.resolveNext();
    } else if (this.lastAction) {
      const opponent = this.getOpponentOf(this.lastAction?.actor);
      const actions = opponent.getSpeed2Actions();
      if (actions.length > 0) return actions.concat(new Pass(opponent));
    }

    return this.getTriggerStateActions();
  }

  private getTurnPlayerResponseActions() {
    Duel.logger.debug("Checking turn player response state actions");
    this.state = State.TurnPlayerResponse;
    const turnPlayerResponseActions: Action[] = [];

    if (turnPlayerResponseActions.length > 0) return turnPlayerResponseActions;

    return this.getOpponentResponseActions();
  }

  private getOpponentResponseActions() {
    Duel.logger.debug("Checking opponent response state actions");
    this.state = State.OpponentResponse;
    const opponentResponseActions: Action[] = [];

    if (opponentResponseActions.length > 0) return opponentResponseActions;

    this.lastAction = null;
    if (this.isMultipleOpenActionState()) return this.getOpenStateActions();
    return this.getPassResponseActions();
  }

  private getPassResponseActions() {
    Duel.logger.debug("Checking pass response state actions");
    this.state = State.PassResponse;
    const actions: Action[] = [];

    if (actions.length > 0) return actions;

    this.startNextPhase();

    this.lastAction = null;

    return this.getOpenStateActions();
  }

  private isMultipleOpenActionState() {
    return (
      [Phase.Main1, Phase.Battle, Phase.Main2].includes(this.phase) &&
      [Step.None, Step.Battle].includes(this.step) &&
      this.attack === null
    );
  }

  private startNextPhase(): void {
    if (this.phase === Phase.End) this.switchTurns();

    if (this.turn === 0 && this.phase === Phase.Main1) {
      this.phase = Phase.End;
      this.activePlayer.startEndPhase();
    } else if (this.phase === Phase.End) {
      this.phase = Phase.Draw;
      this.activePlayer.startDrawPhase();
    } else if (this.phase === Phase.Draw) {
      this.phase = Phase.Standby;
      this.activePlayer.startStandbyPhase();
    } else if (this.phase === Phase.Standby) {
      this.phase = Phase.Main1;
      this.activePlayer.startMainPhase1();
    } else if (this.phase === Phase.Main1) {
      this.phase = Phase.Battle;
      this.activePlayer.startBattlePhase();
      this.startNextStep();
    } else if (this.phase === Phase.Battle) {
      this.startNextStep();
      if (this.step === Step.None) {
        this.phase = Phase.Main2;
        this.activePlayer.startMainPhase2();
      }
    } else {
      this.phase = Phase.End;
      this.activePlayer.startEndPhase();
    }
  }

  switchTurns() {
    this.turn++;
    this.activePlayer.havingTurn = false;
    this.activePlayer = this.getOpponentOf(this.activePlayer);
    this.activePlayer.havingTurn = true;
    Duel.logger.info(`Switched to player ${this.activePlayer}`);
  }

  private startNextStep(): void {
    Duel.logger.debug(`Step is ${this.step}`);
    if (this.step === Step.None) this.step = Step.Start;
    else if (this.step === Step.Start) this.step = Step.Battle;
    else if (this.step === Step.Battle && this.attack) this.step = Step.Damage;
    else if (this.step === Step.Battle) this.step = Step.End;
    else if (this.step === Step.Damage) {
      this.startNextBattleStepTiming();
      if (this.timing === Timing.None) {
        this.step = Step.Battle;
        this.attack = null;
      }
    } else this.step = Step.None;
    Duel.logger.debug(`Step is ${this.step}`);
  }

  private startNextBattleStepTiming() {
    Duel.logger.debug(`Timing is ${this.timing}`);
    if (this.timing === Timing.None) this.timing = Timing.StartDamageStep;
    else if (this.timing === Timing.StartDamageStep)
      this.timing = Timing.BeforeDamageCalculation;
    else if (this.timing === Timing.BeforeDamageCalculation)
      this.timing = Timing.DuringDamageCalculation;
    else if (this.timing === Timing.DuringDamageCalculation) {
      this.attack?.performDamageCalculation();
      this.timing = Timing.AfterDamageCalculation;
    } else if (this.timing === Timing.AfterDamageCalculation)
      this.timing = Timing.EndDamageStep;
    else if (this.timing === Timing.EndDamageStep) {
      this.attack?.performEnd();
      this.timing = Timing.None;
    }
  }
}
