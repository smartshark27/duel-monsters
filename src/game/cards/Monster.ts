import { MonsterPosition, Phase, Step } from "../../enums";
import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../utils/LoggerFactory";
import Utils from "../../utils/Utils";
import Action from "../Action";
import Attack from "../actions/Attack";
import AttackSelector from "../actions/AttackSelector";
import NormalSummon from "../actions/NormalSummon";
import TributeSummon from "../actions/TributeSummon";
import Card from "../Card";
import MonsterZone from "../field/MonsterZone";
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
    if (this.canTributeSummon()) {
      // actions.push(new SelectTributeSummon(this.controller, this));
    }
    if (this.canAttack()) {
      actions.push(this.getAttackSelectorAction());
    }
    return actions;
  }

  override reset(): void {
    super.reset();
    this.attacksRemaining = 1;
    this.originalAttack = this.data.attack as number;
    this.originalDefence = this.data.defence as number;
    this.originalLevel = this.data.level as number;
    this.tributesRequired = this.getTributesRequired();
  }

  getTributeSummonActions(): TributeSummon[] {
    const zonesWithMonsters: MonsterZone[] =
      this.controller.field.getZonesWithMonsters();
    if (this.tributesRequired === 1) {
      const tributeZone = Utils.getRandomItemFromArray(zonesWithMonsters);
      return [
        new TributeSummon(this.controller, this, tributeZone, tributeZone.card),
      ];
    }
    const tributePairs = Utils.getAllPairsFromArray(zonesWithMonsters);
    return tributePairs.map(
      (pair) =>
        new TributeSummon(
          this.controller,
          this,
          pair[0],
          pair.map((zone) => zone.card)
        )
    );
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

  destroyByBattle(): void {
    this.destroy();
  }

  getAttackActions(): Attack[] {
    const opponent = global.DUEL.getOpponentOf(this.controller);
    const monsterTargets = opponent.field.getMonsters();
    if (monsterTargets.length > 0) {
      return monsterTargets.map(
        (target) => new Attack(this.controller, this, target)
      );
    }
    return [new Attack(this.controller, this, opponent)];
  }

  private getTributesRequired(): number {
    const level = this.getLevel();
    if (level > 6) return 2;
    else if (level > 4) return 1;
    return 0;
  }

  private canNormalSummon(): boolean {
    return this.controller.canNormalSummon() && this.tributesRequired === 0;
  }

  private canTributeSummon(): boolean {
    return (
      this.controller.canTributeSummon(this.tributesRequired) &&
      this.tributesRequired > 0
    );
  }

  private canAttack(): boolean {
    return (
      global.DUEL.phase === Phase.Battle &&
      global.DUEL.step === Step.Battle &&
      this.attacksRemaining > 0 &&
      this.controller.field.getZoneOf(this) != null
    );
  }

  private getNormalSummonAction(): NormalSummon {
    return new NormalSummon(
      this.controller,
      this,
      this.controller.field.getRandomFreeMonsterZone() as MonsterZone
    );
  }

  private getAttackSelectorAction(): Action {
    return new AttackSelector(this.controller, this);
  }
}
