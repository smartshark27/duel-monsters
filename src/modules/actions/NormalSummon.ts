import Card from "../Card";
import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Action from "./Action";
import MonsterZone from "../MonsterZone";
import Monster from "../Monster";
import Util from "../../util/Util";

export default class NormalSummon extends Action {
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
}
