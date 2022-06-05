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
import NormalSummon from "./actions/NormalSummon";
import Activation from "./actions/Activation";
import Pass from "./actions/Pass";

export default class Duel {
  activePlayer: Player;
  actionSelection: Action[] = [];
  chain = new Chain();
  turn = 0;

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
  }

  performAction(action?: Action): Action[] {
    if (action) action.perform();
    if (this.actionSelection.length > 0) return this.getActionSelection();
    return this.getActions(action);
  }

  getActions(performedAction?: Action): Action[] {
    switch (this.state) {
      case State.Open:
        return this.getOpenActions(performedAction);
    }
    return [];
  }

  getOpenActions(performedAction?: Action): Action[] {
    this.state = State.Open;

    if (performedAction instanceof NormalSummon) {
      this.summonTiming = SummonTiming.NegationWindow;
      return this.getTurnPlayerMandatoryTriggeredActions();
    } else if (this.summonTiming === SummonTiming.NegationWindow) {
      this.summonTiming = SummonTiming.ResponseWindow;
      return this.getTurnPlayerMandatoryTriggeredActions();
    } else if (this.summonTiming === SummonTiming.ResponseWindow) {
      this.summonTiming = SummonTiming.None;
      return this.getTurnPlayerMandatoryTriggeredActions();
    } else if (performedAction instanceof Activation) {
      return this.getChainBuildActions(performedAction);
    }

    if (performedAction instanceof Pass) return this.getPassResponseActions();

    return this.activePlayer.getSpeed1Actions();
  }

  getTurnPlayerMandatoryTriggeredActions(): Action[] {
    this.state = State.TurnPlayerMandatoryTrigger;

    const actions = this.activePlayer
      .getMandatoryTriggeredActions(events);
    if (actions.length > 1) return actions;
    else if (actions.length === 1) {
      actions[0].perform();
    }

    return this.getOpponentMandatoryTriggeredActions();
  }

  getOpponentMandatoryTriggeredActions(): Action[] {
    this.state = State.OpponentMandatoryTrigger;

    const opponent = this.getOpponentOf(this.activePlayer);
    const actions = opponent
      .getMandatoryTriggeredActions(events);
    if (actions.length > 1) return actions;
    else if (actions.length === 1) {
      actions[0].perform();
    }

    return this.getTurnPlayerOptionalTriggeredActions();
  }

  getTurnPlayerOptionalTriggeredActions(): Action[] {
    this.state = State.TurnPlayerOptionalTrigger;

    const actions = this.activePlayer
      .getOptionalTriggeredActions(events);
    if (actions.length > 0) {
      return actions;
    }

    return this.getOpponentOptionalTriggeredActions();
  }

  getOpponentOptionalTriggeredActions(): Action[] {
    this.state = State.TurnPlayerOptionalTrigger;

    const opponent = this.getOpponentOf(this.activePlayer);
    const actions = this.activePlayer
      .getOptionalTriggeredActions(events);
    if (actions.length > 0) {
      return actions;
    }

    if (this.chain.getLength() > 0) return this.getChainBuildActions();
    return this.getTurnPlayerResponseActions();
  }

  getChainBuildActions(performedAction?: Action): Action[] {
    this.state = State.ChainBuild;

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
    this.state = State.ChainResolve;

    this.chain.resolveNext();
    if (this.actionSelection.length > 0) return this.getActionSelection();
    if (this.chain.getLength() > 0) return this.getChainResolveActions();
    return this.getTurnPlayerMandatoryTriggeredActions();
  }

  getTurnPlayerResponseActions(performedAction?: Action): Action[] {
    this.state = State.TurnPlayerResponse;

    if (performedAction instanceof Activation) return this.getChainBuildActions();
    if (!performedAction) return this.activePlayer.getSpeed2Actions();
    return this.getOpponentResponseActions();
  }

  getOpponentResponseActions(performedAction?: Action): Action[] {
    this.state = State.OpponentResponse;

    if (performedAction instanceof Activation) return this.getChainBuildActions();
    const opponent = this.getOpponentOf(this.activePlayer);
    if (!performedAction) return opponent.getSpeed2Actions();
    return this.getOpenActions();
  }

  getPassResponseActions(performedAction?: Action): Action[] {
    this.state = State.PassResponse;

    if (performedAction instanceof Activation) return this.getChainBuildActions();
    const opponent = this.getOpponentOf(this.activePlayer);
    if (!performedAction) return opponent.getSpeed2Actions();

    this.proceed();
    return this.getOpenActions();
  }

  getOpponentOf(player: Player): Player {
    return this.players.indexOf(player) === 0
      ? this.players[1]
      : this.players[0];
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
    if (this.phase === Phase.End) this.switchTurns();

    if (this.summonTiming === SummonTiming.NegationWindow)
      this.summonTiming = SummonTiming.ResponseWindow;
    else if (this.summonTiming === SummonTiming.ResponseWindow)
      this.summonTiming = SummonTiming.None;
    else if (this.battleStepTiming === BattleStepTiming.AttackDeclarationWindow)
      this.battleStepTiming = BattleStepTiming.BeforeDamageStep;
    else if (this.battleStepTiming === BattleStepTiming.BeforeDamageStep) {
      
    }

    if (this.turn === 0 && this.phase === Phase.Main1) {
      this.phase = Phase.End;
    } else if (this.phase === Phase.End) {
      this.phase = Phase.Draw;
    } else if (this.phase === Phase.Draw) {
      this.phase = Phase.Standby;
    } else if (this.phase === Phase.Standby) {
      this.phase = Phase.Main1;
    } else if (this.phase === Phase.Main1) {
      this.phase = Phase.Battle;
      this.startNextBattleStep();
    } else if (this.phase === Phase.Battle) {
      this.startNextBattleStep();
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
    this.activePlayer = this.getOpponentOf(this.activePlayer);
    Duel.logger.info(`Switched turn to player ${this.activePlayer}`);
  }

  private getActionSelection(): Action[] {
    const actions = this.actionSelection;
    this.actionSelection = [];
    return actions;
  }

  // private startNextStep(): void {
  //   Duel.logger.debug(`Step is ${this.step}`);
  //   if (this.step === Step.None) this.step = Step.Start;
  //   else if (this.step === Step.Start) this.step = Step.Battle;
  //   else if (
  //     this.step === Step.Battle &&
  //     this.attack &&
  //     !this.attack.canProceedToDamageStep()
  //   ) {
  //     this.attack = null;
  //     this.step = Step.Battle;
  //   } else if (this.step === Step.Battle && this.attack)
  //     this.step = Step.Damage;
  //   else if (this.step === Step.Battle) this.step = Step.End;
  //   else if (this.step === Step.Damage) {
  //     this.startNextDamageStepTiming();
  //     if (this.timing === Timing.None) {
  //       this.step = Step.Battle;
  //       this.attack = null;
  //     }
  //   } else this.step = Step.None;
  //   Duel.logger.debug(`Step is ${this.step}`);
  // }

  // private startNextDamageStepTiming() {
  //   Duel.logger.debug(`Timing is ${this.timing}`);
  //   if (this.timing === Timing.None) this.timing = Timing.StartDamageStep;
  //   else if (this.timing === Timing.StartDamageStep)
  //     this.timing = Timing.BeforeDamageCalculation;
  //   else if (this.timing === Timing.BeforeDamageCalculation)
  //     this.timing = Timing.DuringDamageCalculation;
  //   else if (this.timing === Timing.DuringDamageCalculation) {
  //     this.attack?.performDamageCalculation();
  //     this.timing = Timing.AfterDamageCalculation;
  //   } else if (this.timing === Timing.AfterDamageCalculation)
  //     this.timing = Timing.EndDamageStep;
  //   else if (this.timing === Timing.EndDamageStep) {
  //     this.attack?.performEnd();
  //     this.timing = Timing.None;
  //   }
  // }
}
