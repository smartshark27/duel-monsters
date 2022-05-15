import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import MonsterZone from "../field/MonsterZone";
import Monster from "../cards/Monster";
import NormalSummon from "./NormalSummon";

export default class TributeSummon extends NormalSummon {
  protected static override logger = LoggerFactory.getLogger("TributeSummon");

  constructor(
    actor: Player,
    monster: Monster,
    monsterZone: MonsterZone,
    private tributes: Monster[]
  ) {
    super(actor, monster, monsterZone);
  }

  override perform(): void {
    super.perform();
    NormalSummon.logger.info(`Tribute summoning ${this.card}`);
    this.tributes.forEach((tribute) => tribute.sendToGraveyard());
    super.perform();
  }

  override toString(): string {
    return `Tribute summon ${this.card} using ${this.tributes}`;
  }
}
