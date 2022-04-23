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
    this.card.controller = this.actor;
    this.monsterZone.card = this.card;
    // TODO: Handle special summoning from other places
    Util.removeItemFromArray(this.card.owner.graveyard, this.card);
  }

  override finalise(): void {
    this.effect.after();
  }

  override toString(): string {
    return `Special summon ${this.card}`;
  }
}
