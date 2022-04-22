import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import MonsterZone from "../field/MonsterZone";
import Monster from "../cards/Monster";
import Util from "../../util/Util";
import Summon from "./Summon";
import Effect from "../Effect";

export default class SpecialSummon extends Summon {
  protected static override logger = LoggerFactory.getLogger("SpecialSummon");

  constructor(
    actor: Player,
    monster: Monster,
    private monsterZone: MonsterZone,
    private effect: Effect
  ) {
    super(actor, monster);
  }

  override perform(): void {
    SpecialSummon.logger.info(`Special summoning ${this.card}`);
    this.monsterZone.card = this.card;
    // TODO: Handle special summoning from other places
    Util.removeItemFromArray(this.actor.graveyard, this.card);
  }

  override finalise(): void {
    this.effect.resolve();
  }

  override toString(): string {
    return `Special summon ${this.card}`;
  }
}
