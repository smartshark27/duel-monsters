import Card from "../Card";
import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import MonsterZone from "../MonsterZone";
import Monster from "../Monster";
import Util from "../../util/Util";
import Summon from "./Summon";

export default class NormalSummon extends Summon {
  protected static override logger = LoggerFactory.getLogger("NormalSummon");

  constructor(
    actor: Player,
    monster: Monster,
    private monsterZone: MonsterZone
  ) {
    super(actor, monster as Card);
  }

  override perform(): void {
    NormalSummon.logger.info(`Normal summoning ${this.card.name}`);
    this.monsterZone.card = this.card;
    Util.removeItemFromArray(this.actor.hand, this.card);
    this.actor.normalSummonsRemaining--;
  }

  override toString(): string {
    return `Normal summon ${this.card.name}`;
  }
}
