import { Phase } from "../enums";
import CardData from "../interfaces/CardData";
import LoggerFactory from "../util/LoggerFactory";
import Util from "../util/Util";
import Action from "./actions/Action";
import Attack from "./actions/Attack";
import NormalSummon from "./actions/NormalSummon";
import TributeSummon from "./actions/TributeSummon";
import Card from "./Card";
import MonsterZone from "./MonsterZone";
import Player from "./Player";

export default class Monster extends Card {
  attacksRemaining = 0;
  protected static override logger = LoggerFactory.getLogger("Monster");
  private tributesRequired: number;

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
    this.tributesRequired = this.getTributesRequired();
  }

  override getActions(): Action[] {
    const possibleActions = [];
    if (this.canNormalSummon()) {
      possibleActions.push(this.getNormalSummonAction());
    }
    if (this.canTributeSummon()) {
      possibleActions.push(...this.getTributeSummonActions());
    }
    if (this.canAttack()) {
      possibleActions.push(...this.getAttackActions());
    }
    return possibleActions;
  }

  getAttackPoints(): number {
    return this.data.attack as number;
  }

  destroyByBattle(): void {
    this.destroy();
    Monster.logger.info(`${this} has been destroyed`);
  }

  private getTributesRequired(): number {
    const level = this.data.level as number;
    if (level > 6) return 2;
    else if (level > 4) return 1;
    return 0;
  }

  private canNormalSummon(): boolean {
    return this.owner.canNormalSummon() && this.tributesRequired === 0;
  }

  private canTributeSummon(): boolean {
    return (
      this.owner.canTributeSummon(this.tributesRequired) &&
      this.tributesRequired > 0
    );
  }

  private canAttack(): boolean {
    return global.DUEL.phase === Phase.Battle && this.attacksRemaining > 0;
  }

  private getNormalSummonAction(): NormalSummon {
    return new NormalSummon(
      this.owner,
      this,
      this.owner.field.getRandomFreeMonsterZone() as MonsterZone
    );
  }

  private getTributeSummonActions(): TributeSummon[] {
    const zonesWithMonsters: MonsterZone[] =
      this.owner.field.getZonesWithMonsters();
    if (this.tributesRequired === 1) {
      const tributeZone = Util.getRandomItemFromArray(zonesWithMonsters);
      return [
        new TributeSummon(this.owner, this, tributeZone, tributeZone.card),
      ];
    }
    const tributePairs = Util.getAllPairsFromArray(zonesWithMonsters);
    return tributePairs.map(
      (pair) =>
        new TributeSummon(
          this.owner,
          this,
          pair[0],
          pair.map((zone) => zone.card)
        )
    );
  }

  private getAttackActions(): Attack[] {
    return global.DUEL.getInactivePlayer()
      .field.getMonsters()
      .map((target) => new Attack(this.owner, this, target));
  }
}
