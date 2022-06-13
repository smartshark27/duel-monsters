import {
  BattlePhaseStep,
  BattleStepTiming,
  MonsterPosition,
} from "../../enums";
import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../utils/LoggerFactory";
import Action from "../Action";
import Attack from "../actions/Attack";
import NormalSummon from "../actions/NormalSummon";
import TributeSummon from "../actions/TributeSummon";
import Card from "../Card";
import Player from "../Player";

export default class Monster extends Card {
  attacksRemaining = 1;
  position = MonsterPosition.Attack;
  protected static override logger = LoggerFactory.getLogger("Monster");
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

  override getSpeed1Actions(): Action[] {
    const actions = super.getSpeed1Actions();
    if (this.canNormalSummon()) actions.push(this.getNormalSummonAction());
    if (this.canAttack()) actions.push(this.getAttackAction());
    return actions;
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
  }

  getLevel(): number {
    return this.level;
  }

  getTributesRequired(): number {
    const level = this.getLevel();
    if (level < 5) return 0;
    else if (level < 7) return 1;
    return 2;
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

  private canAttack(): boolean {
    return (
      global.DUEL.battlePhaseStep === BattlePhaseStep.Battle &&
      global.DUEL.battleStepTiming === BattleStepTiming.None &&
      this.controller.isTurnPlayer() &&
      this.isOnField() &&
      this.attacksRemaining > 0
    );
  }

  private getAttackAction(): Attack {
    return new Attack(this.controller, this);
  }
}
