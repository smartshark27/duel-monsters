import { BattlePhaseStep, DamageStepTiming, Phase, State } from "../enums";
import LoggerFactory from "../utils/LoggerFactory";
import Action from "./Action";
import Chain from "./Chain";
import Player from "./Player";
import Activation from "./actions/Activation";
import Pass from "./actions/Pass";
import Draw from "./actions/Draw";
import Attack from "./actions/Attack";
import Summon from "./actions/Summon";
import EventManager from "./EventManager";
import Utils from "../utils/Utils";

export default class Duel {
  turnPlayer: Player;
  actionSelection: Action[] = [];
  chain = new Chain();
  eventManager = new EventManager();
  turn = 1;
  winner: Player | undefined;

  phase = Phase.Main1;
  state = State.Open;
  battlePhaseStep = BattlePhaseStep.None;
  damageStepTiming = DamageStepTiming.None;

  summon: Summon | null = null;
  attack: Attack | null = null;

  private static logger = LoggerFactory.getLogger("Duel");

  constructor(private players: Player[]) {
    Duel.logger.info("Creating duel");
    this.players.forEach((player) => player.init());
    this.turnPlayer = Utils.getRandomItemFromArray(players);
    Duel.logger.info(`${this.turnPlayer} will go first`);
    this.turnPlayer.startMainPhase1();
  }

  performAction(action?: Action): Action[] {
    if (action) action.perform();
    if (this.checkWin()) return [];

    const actions: Action[] =
      this.actionSelection.length > 0
        ? this.getActionSelection()
        : this.getActions(action);
    if (this.checkWin()) return [];
    this.eventManager.clearLastEvents();

    Duel.logger.info(this);
    this.logActions(actions);

    return actions;
  }

  getActions(performedAction?: Action): Action[] {
    switch (this.state) {
      case State.Open:
        return this.getOpenActions(performedAction);
      case State.TurnPlayerMandatoryTrigger:
        return this.getTurnPlayerMandatoryTriggeredActions();
      case State.OpponentMandatoryTrigger:
        return this.getOpponentMandatoryTriggeredActions();
      case State.TurnPlayerOptionalTrigger:
        return this.getTurnPlayerOptionalTriggeredActions(performedAction);
      case State.OpponentOptionalTrigger:
        return this.getOpponentOptionalTriggeredActions(performedAction);
      case State.TurnPlayerResponse:
        return this.getTurnPlayerResponseActions(performedAction);
      case State.OpponentResponse:
        return this.getOpponentResponseActions(performedAction);
      case State.ChainBuild:
        return this.getChainBuildActions(performedAction);
      case State.ChainResolve:
        return this.getChainResolveActions();
      case State.PassResponse:
        return this.getPassResponseActions(performedAction);
    }
  }

  getOpenActions(performedAction?: Action): Action[] {
    this.setState(State.Open);

    if (this.isDuringTiming())
      return this.getTurnPlayerMandatoryTriggeredActions();

    if (this.chain.links.length > 0)
      return this.getChainBuildActions(performedAction);
    if (performedAction instanceof Pass) return this.getPassResponseActions();
    else if (performedAction)
      return this.getTurnPlayerMandatoryTriggeredActions();

    const actions = this.turnPlayer.getSpeed1Actions();
    if (actions.length === 0) return this.getPassResponseActions();
    else if (actions.length === 1 && actions[0] instanceof Draw) return actions;
    return actions.concat(new Pass(this.turnPlayer));
  }

  getTurnPlayerMandatoryTriggeredActions(): Action[] {
    this.setState(State.TurnPlayerMandatoryTrigger);

    const actions = this.turnPlayer.getMandatoryTriggeredActions(
      this.eventManager.queuedEvents
    );
    if (actions.length > 1) return actions;
    else if (actions.length === 1) actions[0].perform();

    return this.getOpponentMandatoryTriggeredActions();
  }

  getOpponentMandatoryTriggeredActions(): Action[] {
    this.setState(State.OpponentMandatoryTrigger);

    const opponent = this.getOpponentOf(this.turnPlayer);
    const actions = opponent.getMandatoryTriggeredActions(
      this.eventManager.queuedEvents
    );
    if (actions.length > 1) return actions;
    else if (actions.length === 1) actions[0].perform();

    return this.getTurnPlayerOptionalTriggeredActions();
  }

  getTurnPlayerOptionalTriggeredActions(performedAction?: Action): Action[] {
    this.setState(State.TurnPlayerOptionalTrigger);

    if (!(performedAction instanceof Pass)) {
      const actions = this.turnPlayer.getOptionalTriggeredActions(
        this.eventManager.queuedEvents
      );
      if (actions.length > 0) return actions;
    }

    return this.getOpponentOptionalTriggeredActions();
  }

  getOpponentOptionalTriggeredActions(performedAction?: Action): Action[] {
    this.setState(State.OpponentOptionalTrigger);

    if (!(performedAction instanceof Pass)) {
      const opponent = this.getOpponentOf(this.turnPlayer);
      const actions = opponent.getOptionalTriggeredActions(
        this.eventManager.queuedEvents
      );
      if (actions.length > 0) return actions;
    }

    this.eventManager.clearQueuedEvents();

    if (this.chain.getLength() > 0) {
      return this.getChainBuildActions();
    }
    return this.getTurnPlayerResponseActions();
  }

  getChainBuildActions(performedAction?: Action): Action[] {
    this.setState(State.ChainBuild);

    if (performedAction) {
      const respondableEvents = this.eventManager.getRespondableEvents();
      const lastActor = performedAction.actor;
      const opponent = this.getOpponentOf(lastActor);
      const opponentActions = opponent.getSpeed2Actions(respondableEvents);
      if (opponentActions.length > 0)
        return (opponentActions as Action[]).concat(new Pass(opponent));

      const lastActorActions = lastActor.getSpeed2Actions(respondableEvents);
      if (performedAction instanceof Pass || lastActorActions.length === 0)
        return this.getChainResolveActions();

      return (lastActorActions as Action[]).concat(new Pass(opponent));
    }

    return this.getChainResolveActions();
  }

  getChainResolveActions(): Action[] {
    this.setState(State.ChainResolve);

    if (this.chain.getLength() > 0) this.chain.resolveNext();
    if (this.actionSelection.length > 0) return this.getActionSelection();
    if (this.chain.getLength() > 0) return this.getChainResolveActions();

    this.chain.cleanup();
    this.eventManager.clearOpenEvents();

    if (this.isDuringSingleChainTiming()) {
      this.proceed();
      return this.getOpenActions();
    }
    return this.getTurnPlayerMandatoryTriggeredActions();
  }

  getTurnPlayerResponseActions(performedAction?: Action): Action[] {
    this.setState(State.TurnPlayerResponse);

    if (performedAction instanceof Activation)
      return this.getChainBuildActions();
    if (!performedAction) {
      const actions = this.turnPlayer.getSpeed2Actions(
        this.eventManager.getRespondableEvents()
      );
      if (actions.length > 0) return actions.concat(new Pass(this.turnPlayer));
    }

    return this.getOpponentResponseActions();
  }

  getOpponentResponseActions(performedAction?: Action): Action[] {
    this.setState(State.OpponentResponse);

    if (performedAction instanceof Activation)
      return this.getChainBuildActions();
    const opponent = this.getOpponentOf(this.turnPlayer);
    if (!performedAction) {
      const actions = opponent.getSpeed2Actions(
        this.eventManager.getRespondableEvents()
      );
      if (actions.length > 0) return actions.concat(new Pass(opponent));
    }

    if (this.isDuringTiming()) this.proceed();

    this.eventManager.clearOpenEvents();
    return this.getOpenActions();
  }

  getPassResponseActions(performedAction?: Action): Action[] {
    this.setState(State.PassResponse);

    if (performedAction instanceof Activation)
      return this.getChainBuildActions();
    const opponent = this.getOpponentOf(this.turnPlayer);
    if (!performedAction) {
      const actions = opponent.getSpeed2Actions();
      if (actions.length > 0) return actions.concat(new Pass(opponent));
    }

    this.proceed();
    return this.getOpenActions();
  }

  isDuringTiming() {
    return this.attack || this.damageStepTiming !== DamageStepTiming.None;
  }

  getOpponentOf(player: Player): Player {
    return this.players.indexOf(player) === 0
      ? this.players[1]
      : this.players[0];
  }

  end(winner: Player): void {
    this.winner = winner;
  }

  toString() {
    return (
      "\n" +
      this.players[0].getFieldString() +
      "\n" +
      this.players[1].getFieldString() +
      "\n" +
      `${this.getPhaseInfoStr()}`
    );
  }

  private isDuringSingleChainTiming() {
    return this.damageStepTiming === DamageStepTiming.DuringDamageCalculation;
  }

  private proceed(): void {
    if (this.phase === Phase.Draw) this.phase = Phase.Standby;
    else if (this.phase === Phase.Standby) {
      this.phase = Phase.Main1;
      this.turnPlayer.startMainPhase1();
    } else if (this.phase === Phase.Main1) {
      if (this.turn === 1) this.phase = Phase.End;
      else {
        this.phase = Phase.Battle;
        this.battlePhaseStep = BattlePhaseStep.Start;
        this.turnPlayer.startBattlePhase();
      }
    } else if (this.battlePhaseStep === BattlePhaseStep.Start)
      this.battlePhaseStep = BattlePhaseStep.Battle;
    else if (this.battlePhaseStep === BattlePhaseStep.Battle && this.attack) {
      this.battlePhaseStep = BattlePhaseStep.Damage;
      this.damageStepTiming = DamageStepTiming.Start;
    } else if (this.damageStepTiming === DamageStepTiming.Start)
      this.damageStepTiming = DamageStepTiming.BeforeDamageCalculation;
    else if (this.damageStepTiming === DamageStepTiming.BeforeDamageCalculation)
      this.damageStepTiming = DamageStepTiming.DuringDamageCalculation;
    else if (
      this.damageStepTiming === DamageStepTiming.DuringDamageCalculation
    ) {
      this.attack?.applyDamageCalculation();
      this.damageStepTiming = DamageStepTiming.AfterDamageCalculation;
    } else if (
      this.damageStepTiming === DamageStepTiming.AfterDamageCalculation
    ) {
      this.damageStepTiming = DamageStepTiming.End;
      this.attack?.destroyMonsters();
    } else if (this.damageStepTiming === DamageStepTiming.End) {
      this.attack = null;
      this.damageStepTiming = DamageStepTiming.None;
      this.battlePhaseStep = BattlePhaseStep.Battle;
    } else if (this.battlePhaseStep === BattlePhaseStep.Battle)
      this.battlePhaseStep = BattlePhaseStep.End;
    else if (this.battlePhaseStep === BattlePhaseStep.End) {
      this.battlePhaseStep = BattlePhaseStep.None;
      this.phase = Phase.Main2;
    } else if (this.phase === Phase.Main2) this.phase = Phase.End;
    else {
      this.turnPlayer.checkHandLimit();
      this.switchTurns();
      this.phase = Phase.Draw;
      this.turnPlayer.startDrawPhase();
    }

    Duel.logger.debug(`Proceeded to ${this.getPhaseInfoStr()}`);
  }

  private switchTurns() {
    this.turn++;
    this.turnPlayer = this.getOpponentOf(this.turnPlayer);
    Duel.logger.info(`Switched turns to player ${this.turnPlayer}`);
  }

  private getActionSelection(): Action[] {
    const actions = this.actionSelection;
    this.actionSelection = [];
    return actions;
  }

  private setState(state: State) {
    Duel.logger.debug(`Setting state as ${state}`);
    this.state = state;
  }

  private checkWin(): boolean {
    if (this.winner) {
      this.logResults();
      return true;
    }
    return false;
  }

  private logActions(actions: Action[]): void {
    var message = `Actions for ${actions[0]?.actor} are:`;
    for (var i = 0; i < actions.length; i++)
      message += `\n  ${i + 1}) ${actions[i]}`;
    Duel.logger.info(message);
  }

  private getPhaseInfoStr(): String {
    var message = `Turn player is ${this.turnPlayer}, phase is ${this.phase}`;
    if (this.battlePhaseStep !== BattlePhaseStep.None)
      message += `, step is ${this.battlePhaseStep}`;
    if (this.damageStepTiming !== DamageStepTiming.None)
      message += `, timing is ${this.damageStepTiming}`;
    return message;
  }

  private logResults(): void {
    Duel.logger.warn(`Game has ended. The winner is ${this.winner}.`);
  }
}
