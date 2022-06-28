import {
  BattlePhaseStep,
  BattlePosition,
  CardFace,
  MonsterAttribute,
  MonsterType,
  Phase,
} from "../../enums";
import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../utils/LoggerFactory";
import Action from "../Action";
import Attack from "../actions/Attack";
import NormalSummon from "../actions/NormalSummon";
import PositionChange from "../actions/BattlePositionChange";
import TributeSummon from "../actions/TributeSummon";
import Card from "../Card";
import Player from "../Player";
import SpecialSummon from "../actions/SpecialSummon";
import MaskedHEROAcidEffects from "../cardeffects/MaskedHEROAcidEffects";
import ElementalHEROStratosEffects from "../cardeffects/ElementalHEROStratosEffects";
import ElementalHEROBubblemanEffects from "../cardeffects/ElementalHEROBubblemanEffects";
import ElementalHEROShadowMistEffects from "../cardeffects/ElementalHEROShadowMistEffects";

export default class Monster extends Card {
  protected static override logger = LoggerFactory.getLogger("Monster");
  attributes: MonsterAttribute[] = [];
  level!: number;
  types: MonsterType[] = [];
  originalAttribute: MonsterAttribute;
  originalLevel!: number;
  originalTypes: MonsterType[] = [];
  originalAttackPoints!: number;
  originalDefencePoints!: number;
  attackPoints!: number;
  defencePoints!: number;
  attacksRemaining = 1;
  position = BattlePosition.Attack;

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
    this.originalAttribute = this.data.attribute as MonsterAttribute;
    this.reset();
  }

  override reset(): void {
    super.reset();
    this.attributes = [this.originalAttribute];
    this.level = this.data.level as number;
    this.types = this.data.monsterTypes as MonsterType[];
    this.originalAttackPoints = this.data.attack as number;
    this.originalDefencePoints = this.data.defence as number;
    this.attackPoints = this.originalAttackPoints;
    this.defencePoints = this.originalDefencePoints;
    this.attacksRemaining = 1;
    this.position = BattlePosition.Attack;
  }

  isExtraDeckType(): boolean {
    return this.types.some((type) => [MonsterType.Fusion].includes(type));
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

  updateAttackPoints(change: number): void {
    this.attackPoints += change;
    this.attackPoints = this.attackPoints < 0 ? 0 : this.attackPoints;
  }

  setPosition(position: BattlePosition): void {
    this.visibility =
      position === BattlePosition.Set ? CardFace.Down : CardFace.Up;
    this.position = position;
    this.turnPositionUpdated = global.DUEL.turn;
  }

  changePosition(): void {
    if (this.position === BattlePosition.Attack)
      this.position = BattlePosition.Defence;
    else if (this.position === BattlePosition.Defence)
      this.position = BattlePosition.Attack;
    else {
      this.position = BattlePosition.Attack;
      this.visibility = CardFace.Up;
    }

    this.turnPositionUpdated = global.DUEL.turn;
  }

  protected override getSpeed1Actions(): Action[] {
    const actions = super.getSpeed1Actions();
    if (this.canNormalSummonOrSet()) actions.push(this.getNormalSummonAction());
    if (this.canChangePosition()) actions.push(this.getPositionChangeAction());
    if (this.canAttack()) actions.push(this.getAttackAction());
    return actions.concat(this.getSpecialSummonActions());
  }

  protected override setEffects(): void {
    if (this.originalName === "Elemental HERO Bubbleman")
      this.effects = new ElementalHEROBubblemanEffects(this);
    else if (this.originalName === "Elemental HERO Shadow Mist")
      this.effects = new ElementalHEROShadowMistEffects(this);
    else if (this.originalName === "Elemental HERO Stratos")
      this.effects = new ElementalHEROStratosEffects(this);
    else if (this.originalName === "Masked HERO Acid")
      this.effects = new MaskedHEROAcidEffects(this);
    else super.setEffects();
  }

  private canNormalSummonOrSet(): boolean {
    return (
      this.controller.canNormalSummonOrSet(this.getTributesRequired()) &&
      this.isInHand()
    );
  }

  private getNormalSummonAction(): NormalSummon {
    return this.getTributesRequired() === 0
      ? new NormalSummon(this.controller, this)
      : new TributeSummon(this.controller, this);
  }

  private getSpecialSummonActions(): SpecialSummon[] {
    return this.effects.getSpecialSummonActions();
  }

  private canChangePosition(): boolean {
    return (
      this.controller.isTurnPlayer() &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase) &&
      !global.DUEL.isDuringTiming() &&
      this.isOnField() &&
      this.turnPositionUpdated < global.DUEL.turn &&
      this.attacksRemaining > 0
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
