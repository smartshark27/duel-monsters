import { MonsterPosition } from "../../enums";
import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../utils/LoggerFactory";
import Action from "../Action";
import NormalSummon from "../actions/NormalSummon";
import Card from "../Card";
import Player from "../Player";

export default class Monster extends Card {
  attacksRemaining!: number;
  position = MonsterPosition.Attack;
  protected static override logger = LoggerFactory.getLogger("Monster");
  private originalAttack!: number;
  private originalDefence!: number;
  private originalLevel!: number;
  private tributesRequired!: number;

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
    this.reset();
  }

  override getSpeed1Actions(): Action[] {
    const actions = super.getSpeed1Actions();
    if (this.canNormalSummon()) {
      actions.push(this.getNormalSummonAction());
    }
    return actions;
  }

  override reset(): void {
    super.reset();
    this.attacksRemaining = 1;
    this.originalAttack = this.data.attack as number;
    this.originalDefence = this.data.defence as number;
    this.originalLevel = this.data.level as number;
  }

  getAttackPoints(): number {
    return this.originalAttack as number;
  }

  getDefencePoints(): number {
    return this.originalDefence;
  }

  getLevel(): number {
    return this.originalLevel;
  }

  private canNormalSummon(): boolean {
    return this.controller.canNormalSummon();
  }

  private getNormalSummonAction(): NormalSummon {
    return new NormalSummon(this.controller, this);
  }
}
