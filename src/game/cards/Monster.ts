import { BattlePhaseStep, BattlePosition, Phase } from "../../enums";
import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../utils/LoggerFactory";
import Action from "../Action";
import Attack from "../actions/Attack";
import NormalSummon from "../actions/NormalSummon";
import PositionChange from "../actions/BattlePositionChange";
import TributeSummon from "../actions/TributeSummon";
import Card from "../Card";
import Player from "../Player";

export default class Monster extends Card {
  protected static override logger = LoggerFactory.getLogger("Monster");
  attacksRemaining = 1;
  position = BattlePosition.Attack;
  originalAttackPoints!: number;
  originalDefencePoints!: number;
  originalLevel!: number;
  attackPoints!: number;
  defencePoints!: number;
  level!: number;

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
    this.reset();
  }

  override reset(): void {
    super.reset();
    this.attacksRemaining = 1;
    this.originalAttackPoints = this.data.attack as number;
    this.originalDefencePoints = this.data.defence as number;
    this.originalLevel = this.data.level as number;
    this.attackPoints = this.originalAttackPoints;
    this.defencePoints = this.originalDefencePoints;
    this.level = this.originalLevel;
    this.position = BattlePosition.Attack;
  }

  getTributesRequired(): number {
    const level = this.level;
    if (level < 5) return 0;
    else if (level < 7) return 1;
    return 2;
  }

  getPoints(): number {
    return this.position === BattlePosition.Attack
      ? this.attackPoints
      : this.defencePoints;
  }

  changePosition(): void {
    this.position =
      this.position === BattlePosition.Attack
        ? BattlePosition.Defence
        : BattlePosition.Attack;
    this.turnPositionUpdated = global.DUEL.turn;
  }

  protected getSpeed1Actions(): Action[] {
    const actions = super.getSpeed1Actions();
    if (this.canNormalSummon()) actions.push(this.getNormalSummonAction());
    if (this.canChangePosition()) actions.push(this.getPositionChangeAction());
    if (this.canAttack()) actions.push(this.getAttackAction());
    return actions;
  }

  private canNormalSummon(): boolean {
    return (
      this.controller.canNormalSummon(this.getTributesRequired()) &&
      this.isInHand()
    );
  }

  private getNormalSummonAction(): NormalSummon {
    return this.getTributesRequired() === 0
      ? new NormalSummon(this.controller, this)
      : new TributeSummon(this.controller, this);
  }

  private canChangePosition(): boolean {
    return (
      this.controller.isTurnPlayer() &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase) &&
      !global.DUEL.isDuringTiming() &&
      this.isOnField() &&
      this.turnPositionUpdated < global.DUEL.turn
    );
  }

  private getPositionChangeAction(): PositionChange {
    return new PositionChange(this.controller, this);
  }

  private canAttack(): boolean {
    return (
      global.DUEL.battlePhaseStep === BattlePhaseStep.Battle &&
      global.DUEL.attack === null &&
      this.controller.isTurnPlayer() &&
      this.isOnField() &&
      this.attacksRemaining > 0 &&
      this.position === BattlePosition.Attack
    );
  }

  private getAttackAction(): Attack {
    return new Attack(this.controller, this);
  }
}
