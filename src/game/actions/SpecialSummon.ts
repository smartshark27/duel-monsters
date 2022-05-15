import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import MonsterZone from "../field/MonsterZone";
import Monster from "../cards/Monster";
import Utils from "../../utils/Utils";
import Summon from "./Summon";

export default class SpecialSummon extends Summon {
  protected static override logger = LoggerFactory.getLogger("SpecialSummon");

  constructor(
    actor: Player,
    monster: Monster,
    private monsterZone: MonsterZone
  ) {
    super(actor, monster);
  }

  override perform(): void {
    super.perform();
    SpecialSummon.logger.info(`Special summoning ${this.card}`);
    this.card.controller = this.actor;
    this.monsterZone.card = this.card;
    // TODO: Handle special summoning from other places
    Utils.removeItemFromArray(this.card.owner.graveyard, this.card);
  }

  override toString(): string {
    return `Special summon ${this.card}`;
  }
}
