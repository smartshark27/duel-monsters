import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import Utils from "../../utils/Utils";
import Summon from "./Summon";
import ZoneSelect from "./ZoneSelect";
import Zone from "../field/Zone";
import { SummonTiming } from "../../enums";

export default class NormalSummon extends Summon {
  protected static override logger = LoggerFactory.getLogger("NormalSummon");

  constructor(actor: Player, monster: Monster) {
    super(actor, monster);
  }

  override perform(): void {
    super.perform();
    this.actor.normalSummonsRemaining--;
    this.setActionSelection(
      this.actor.field
        .getFreeMonsterZones()
        .map(
          (zone) =>
            new ZoneSelect(
              this.actor,
              zone,
              (zone) => this.normalSummonToZone(zone)
            )
        )
    );
  }

  normalSummonToZone(zone: Zone) {
    Utils.removeItemFromArray(this.actor.hand, this.card);
    zone.card = this.card;
    global.DUEL.summon = this;
    global.DUEL.summonTiming = SummonTiming.NegationWindow;
  }

  override toString(): string {
    return `Normal summon ${this.card}`;
  }
}
