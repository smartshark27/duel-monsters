import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import MonsterZone from "../field/MonsterZone";
import Monster from "../cards/Monster";
import Utils from "../../utils/Utils";
import Summon from "./Summon";

export default class NormalSummon extends Summon {
  protected static override logger = LoggerFactory.getLogger("NormalSummon");

  constructor(
    actor: Player,
    monster: Monster,
    private monsterZone: MonsterZone
  ) {
    super(actor, monster);
  }

  override perform(): void {
    super.perform();
    NormalSummon.logger.info(`Normal summoning ${this.card}`);
    this.monsterZone.card = this.card;
    Utils.removeItemFromArray(this.actor.hand, this.card);
    this.actor.normalSummonsRemaining--;
  }

  override toString(): string {
    return `Normal summon ${this.card}`;
  }
}
