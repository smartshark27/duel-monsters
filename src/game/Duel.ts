import {
  BattlePhaseStep,
  BattleStepTiming,
  DamageStepTiming,
  Phase,
  State,
  SummonTiming,
} from "../enums";
import LoggerFactory from "../utils/LoggerFactory";
import Action from "./Action";
import Chain from "./Chain";
import Player from "./Player";
import Activation from "./actions/Activation";
import Pass from "./actions/Pass";
import DuelEvent from "./DuelEvent";
import Draw from "./actions/Draw";

export default class Duel {
  activePlayer: Player;
  actionSelection: Action[] = [];
  queuedEvents: DuelEvent[] = [];
  pastEvents: DuelEvent[] = [];
  chain = new Chain();
  turn = 1;
  winner: Player | undefined;

  phase = Phase.Main1;
  state = State.Open;
  summonTiming = SummonTiming.None;
  battlePhaseStep = BattlePhaseStep.None;
  battleStepTiming = BattleStepTiming.None;
  damageStepTiming = DamageStepTiming.None;

  private static logger = LoggerFactory.getLogger("Duel");

  constructor(private players: Player[]) {
    Duel.logger.info("Creating duel");
    this.activePlayer = players[0];
    this.players.forEach((player) => player.init());
    this.activePlayer.startMainPhase1();
  }

  performAction(action?: Action): Action[] {
    if (action) action.perform();
    if (this.winner) {
      this.logResults();
      return [];
    }
    const actions: Action[] =
      this.actionSelection.length > 0
        ? this.getActionSelection()
        : this.getActions(action);
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
        return this.getTurnPlayerOptionalTriggeredActions();
      case State.OpponentOptionalTrigger:
        return this.getOpponentOptionalTriggeredActions();
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

    if (this.summonTiming === SummonTiming.NegationWindow)
      return this.getTurnPlayerMandatoryTriggeredActions();
    if (this.summonTiming === SummonTiming.ResponseWindow)
      return this.getTurnPlayerMandatoryTriggeredActions();
    if (performedAction instanceof Activation)
      return this.getChainBuildActions(performedAction);
    if (performedAction instanceof Pass) return this.getPassResponseActions();

    const actions = this.activePlayer.getSpeed1Actions();
    return actions.length > 0 && !(actions[0] instanceof Draw)
      ? actions.concat(new Pass(this.activePlayer))
      : this.getPassResponseActions();
  }

  getTurnPlayerMandatoryTriggeredActions(): Action[] {
    this.setState(State.TurnPlayerMandatoryTrigger);

    const actions = this.activePlayer.getMandatoryTriggeredActions(
      this.queuedEvents
    );
    if (actions.length > 1) return actions;
    else if (actions.length === 1) actions[0].perform();

    return this.getOpponentMandatoryTriggeredActions();
  }

  getOpponentMandatoryTriggeredActions(): Action[] {
    this.setState(State.OpponentMandatoryTrigger);

    const opponent = this.getOpponentOf(this.activePlayer);
    const actions = opponent.getMandatoryTriggeredActions(this.queuedEvents);
    if (actions.length > 1) return actions;
    else if (actions.length === 1) actions[0].perform();

    return this.getTurnPlayerOptionalTriggeredActions();
  }

  getTurnPlayerOptionalTriggeredActions(): Action[] {
    this.setState(State.TurnPlayerOptionalTrigger);

    const actions = this.activePlayer.getOptionalTriggeredActions(
      this.queuedEvents
    );
    if (actions.length > 0) return actions;

    return this.getOpponentOptionalTriggeredActions();
  }

  getOpponentOptionalTriggeredActions(): Action[] {
    this.setState(State.OpponentOptionalTrigger);

    const opponent = this.getOpponentOf(this.activePlayer);
    const actions = opponent.getOptionalTriggeredActions(this.queuedEvents);
    if (actions.length > 0) return actions;

    if (this.chain.getLength() > 0) return this.getChainBuildActions();
    return this.getTurnPlayerResponseActions();
  }

  getChainBuildActions(performedAction?: Action): Action[] {
    this.setState(State.ChainBuild);

    if (performedAction) {
      const lastActor = performedAction.actor;
      const opponent = this.getOpponentOf(lastActor);
      const opponentActions = opponent.getSpeed2Actions();
      if (opponentActions.length > 0)
        return (opponentActions as Action[]).concat(new Pass(opponent));

      const lastActorActions = lastActor.getSpeed2Actions();
      if (performedAction instanceof Pass || lastActorActions.length === 0)
        return this.getChainResolveActions();

      return (opponentActions as Action[]).concat(new Pass(opponent));
    }

    return this.getChainResolveActions();
  }

  getChainResolveActions(): Action[] {
    this.setState(State.ChainResolve);

    this.chain.resolveNext();
    if (this.actionSelection.length > 0) return this.getActionSelection();
    if (this.chain.getLength() > 0) return this.getChainResolveActions();
    return this.getTurnPlayerMandatoryTriggeredActions();
  }

  getTurnPlayerResponseActions(performedAction?: Action): Action[] {
    this.setState(State.TurnPlayerResponse);

    if (performedAction instanceof Activation)
      return this.getChainBuildActions();
    if (!performedAction) {
      const actions = this.activePlayer.getSpeed2Actions();
      if (actions.length > 0)
        return actions.concat(new Pass(this.activePlayer));
    }

    return this.getOpponentResponseActions();
  }

  getOpponentResponseActions(performedAction?: Action): Action[] {
    this.setState(State.OpponentResponse);

    if (performedAction instanceof Activation)
      return this.getChainBuildActions();
    const opponent = this.getOpponentOf(this.activePlayer);
    if (!performedAction) {
      const actions = opponent.getSpeed2Actions();
      if (actions.length > 0) return actions.concat(new Pass(opponent));
    }

    if (
      [SummonTiming.NegationWindow, SummonTiming.ResponseWindow].includes(
        this.summonTiming
      )
    )
      this.proceed();
    return this.getOpenActions();
  }

  getPassResponseActions(performedAction?: Action): Action[] {
    this.setState(State.PassResponse);

    if (performedAction instanceof Activation)
      return this.getChainBuildActions();
    const opponent = this.getOpponentOf(this.activePlayer);
    if (!performedAction) {
      const actions = opponent.getSpeed2Actions();
      if (actions.length > 0) return actions.concat(new Pass(opponent));
    }

    this.proceed();
    return this.getOpenActions();
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
      `Top monsters are ${this.players[0].field.getMonsters()}, Bottom monsters are ${this.players[1].field.getMonsters()}`
    );
  }

  private proceed(): void {
    if (this.phase === Phase.Draw) this.phase = Phase.Standby;
    else if (this.phase === Phase.Standby) {
      this.phase = Phase.Main1;
      this.activePlayer.startMainPhase1();
    } else if (this.summonTiming === SummonTiming.NegationWindow)
      this.summonTiming = SummonTiming.ResponseWindow;
    else if (this.summonTiming === SummonTiming.ResponseWindow)
      this.summonTiming = SummonTiming.None;
    else if (this.phase === Phase.Main1) {
      if (this.turn === 0) this.phase = Phase.End;
      else {
        this.phase = Phase.Battle;
        this.battlePhaseStep = BattlePhaseStep.Start;
      }
    } else if (this.battlePhaseStep === BattlePhaseStep.Start)
      this.battlePhaseStep = BattlePhaseStep.Battle;
    else if (this.battleStepTiming === BattleStepTiming.AttackDeclarationWindow)
      this.battleStepTiming = BattleStepTiming.BeforeDamageStep;
    else if (this.battleStepTiming === BattleStepTiming.BeforeDamageStep) {
      this.battleStepTiming = BattleStepTiming.None;
      this.battlePhaseStep = BattlePhaseStep.Damage;
      this.damageStepTiming = DamageStepTiming.Start;
    } else if (this.damageStepTiming === DamageStepTiming.Start)
      this.damageStepTiming = DamageStepTiming.BeforeDamageCalculation;
    else if (this.damageStepTiming === DamageStepTiming.BeforeDamageCalculation)
      this.damageStepTiming = DamageStepTiming.DuringDamageCalculation;
    else if (this.damageStepTiming === DamageStepTiming.DuringDamageCalculation)
      this.damageStepTiming = DamageStepTiming.AfterDamageCalculation;
    else if (
      this.damageStepTiming === DamageStepTiming.AfterDamageCalculation
    ) {
      this.damageStepTiming = DamageStepTiming.None;
      this.battlePhaseStep = BattlePhaseStep.Battle;
    } else if (
      this.battlePhaseStep === BattlePhaseStep.Battle &&
      this.battleStepTiming === BattleStepTiming.None
    )
      this.battlePhaseStep = BattlePhaseStep.End;
    else if (this.battlePhaseStep === BattlePhaseStep.End) {
      this.battlePhaseStep = BattlePhaseStep.None;
      this.phase = Phase.Main2;
    } else if (this.phase === Phase.Main2) this.phase = Phase.End;
    else {
      this.switchTurns();
      this.phase = Phase.Draw;
      this.activePlayer.startDrawPhase();
    }

    Duel.logger.info(
      `Switched to phase ${this.phase}, step ${this.battlePhaseStep} for player ${this.activePlayer}`
    );
  }

  logActions(actions: Action[]): void {
    Duel.logger.info(this);
    Duel.logger.debug(
      `Phase is ${this.phase}, Step is ${this.battlePhaseStep}`
    );
    Duel.logger.info(`Actions for ${actions[0]?.actor} are [${actions}]`);
  }

  private switchTurns() {
    this.turn++;
    this.activePlayer = this.getOpponentOf(this.activePlayer);
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

  private logResults(): void {
    Duel.logger.warn(`Game has ended. The winner is ${this.winner}.`);
  }
}
