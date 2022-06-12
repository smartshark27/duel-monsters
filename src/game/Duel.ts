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
import Attack from "./actions/Attack";
import Summon from "./actions/Summon";

export default class Duel {
  turnPlayer: Player;
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

  summon: Summon | null = null;
  attack: Attack | null = null;

  private static logger = LoggerFactory.getLogger("Duel");

  constructor(private players: Player[]) {
    Duel.logger.info("Creating duel");
    this.turnPlayer = players[0];
    this.players.forEach((player) => player.init());
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

    if (this.isDuringTiming())
      return this.getTurnPlayerMandatoryTriggeredActions();

    if (performedAction instanceof Activation)
      return this.getChainBuildActions(performedAction);
    if (performedAction instanceof Pass) return this.getPassResponseActions();

    const actions = this.turnPlayer.getSpeed1Actions();
    if (actions.length === 0) return this.getPassResponseActions();
    else if (actions.length === 1 && actions[0] instanceof Draw) return actions;
    return actions.concat(new Pass(this.turnPlayer));
  }

  getTurnPlayerMandatoryTriggeredActions(): Action[] {
    this.setState(State.TurnPlayerMandatoryTrigger);

    const actions = this.turnPlayer.getMandatoryTriggeredActions(
      this.queuedEvents
    );
    if (actions.length > 1) return actions;
    else if (actions.length === 1) actions[0].perform();

    return this.getOpponentMandatoryTriggeredActions();
  }

  getOpponentMandatoryTriggeredActions(): Action[] {
    this.setState(State.OpponentMandatoryTrigger);

    const opponent = this.getOpponentOf(this.turnPlayer);
    const actions = opponent.getMandatoryTriggeredActions(this.queuedEvents);
    if (actions.length > 1) return actions;
    else if (actions.length === 1) actions[0].perform();

    return this.getTurnPlayerOptionalTriggeredActions();
  }

  getTurnPlayerOptionalTriggeredActions(): Action[] {
    this.setState(State.TurnPlayerOptionalTrigger);

    const actions = this.turnPlayer.getOptionalTriggeredActions(
      this.queuedEvents
    );
    if (actions.length > 0) return actions;

    return this.getOpponentOptionalTriggeredActions();
  }

  getOpponentOptionalTriggeredActions(): Action[] {
    this.setState(State.OpponentOptionalTrigger);

    const opponent = this.getOpponentOf(this.turnPlayer);
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
      const actions = this.turnPlayer.getSpeed2Actions();
      if (actions.length > 0)
        return actions.concat(new Pass(this.turnPlayer));
    }

    return this.getOpponentResponseActions();
  }

  getOpponentResponseActions(performedAction?: Action): Action[] {
    this.setState(State.OpponentResponse);

    if (performedAction instanceof Activation)
      return this.getChainBuildActions();
    const opponent = this.getOpponentOf(this.turnPlayer);
    if (!performedAction) {
      const actions = opponent.getSpeed2Actions();
      if (actions.length > 0) return actions.concat(new Pass(opponent));
    }

    if (this.isDuringTiming()) this.proceed();

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
      this.turnPlayer.startMainPhase1();
    } else if (this.summonTiming === SummonTiming.NegationWindow && this.summon)
      this.summonTiming = SummonTiming.ResponseWindow;
    else if (this.summonTiming === SummonTiming.NegationWindow && !this.summon)
      this.summonTiming = SummonTiming.None;
    else if (this.summonTiming === SummonTiming.ResponseWindow) {
      this.summon = null;
      this.summonTiming = SummonTiming.None;
    } else if (this.phase === Phase.Main1) {
      if (this.turn === 1) this.phase = Phase.End;
      else {
        this.phase = Phase.Battle;
        this.battlePhaseStep = BattlePhaseStep.Start;
        this.turnPlayer.startBattlePhase();
      }
    } else if (this.battlePhaseStep === BattlePhaseStep.Start)
      this.battlePhaseStep = BattlePhaseStep.Battle;
    else if (
      this.battleStepTiming === BattleStepTiming.AttackDeclarationWindow &&
      this.attack
    )
      this.battleStepTiming = BattleStepTiming.BeforeDamageStep;
    else if (
      this.battleStepTiming === BattleStepTiming.BeforeDamageStep &&
      this.attack
    ) {
      this.battleStepTiming = BattleStepTiming.None;
      this.battlePhaseStep = BattlePhaseStep.Damage;
      this.damageStepTiming = DamageStepTiming.Start;
    } else if (this.battleStepTiming !== BattleStepTiming.None && !this.attack)
      this.battleStepTiming = BattleStepTiming.None;
    else if (this.damageStepTiming === DamageStepTiming.Start)
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

  private isDuringTiming() {
    return (
      this.summonTiming !== SummonTiming.None ||
      this.battleStepTiming !== BattleStepTiming.None ||
      this.damageStepTiming !== DamageStepTiming.None
    );
  }

  private checkWin(): boolean {
    if (this.winner) {
      this.logResults();
      return true;
    }
    return false;
  }

  private logActions(actions: Action[]): void {
    Duel.logger.info(this);
    Duel.logger.info(this.getPhaseInfoStr());
    Duel.logger.info(`Actions for ${actions[0]?.actor} are [${actions}]`);
  }

  private getPhaseInfoStr(): String {
    var message = `Turn player is ${this.turnPlayer}, phase is ${this.phase}`;
    if (this.battlePhaseStep !== BattlePhaseStep.None)
      message += `, step is ${this.battlePhaseStep}`;
    if (this.summonTiming !== SummonTiming.None)
      message += `, timing is ${this.summonTiming}`;
    if (this.battleStepTiming !== BattleStepTiming.None)
      message += `, timing is ${this.battleStepTiming}`;
    if (this.damageStepTiming !== DamageStepTiming.None)
      message += `, timing is ${this.damageStepTiming}`;
    return message;
  }

  private logResults(): void {
    Duel.logger.warn(`Game has ended. The winner is ${this.winner}.`);
  }
}
