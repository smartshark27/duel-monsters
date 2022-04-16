import { Phase } from "../enums";
import CardData from "../interfaces/CardData";
import LoggerFactory from "../util/LoggerFactory";
import Action from "./actions/Action";
import Attack from "./actions/Attack";
import NormalSummon from "./actions/NormalSummon";
import Card from "./Card";
import Player from "./Player";

export default class Monster extends Card {
  attacksRemaining = 0;
  protected static override logger = LoggerFactory.getLogger("Monster");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }

  override getActions(): Action[] {
    const possibleActions = [];
    if (this.canNormalSummon()) {
      possibleActions.push(
        new NormalSummon(
          this.owner,
          this,
          this.owner.field.getRandomFreeMonsterZone()
        )
      );
    }
    if (this.canAttack()) {
      const attackActions = global.DUEL.getInactivePlayer()
        .field.getMonsters()
        .map((target) => new Attack(this.owner, this, target));
      if (attackActions.length > 0) {
        possibleActions.push(...attackActions);
      }
    }
    return possibleActions;
  }

  getAttackPoints(): number {
    return this.data.attack as number;
  }

  private canNormalSummon(): boolean {
    return this.owner.canNormalSummon();
  }

  private canAttack(): boolean {
    return global.DUEL.phase === Phase.Battle && this.attacksRemaining > 0;
  }
}
