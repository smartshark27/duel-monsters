import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import Utils from "../../utils/Utils";
import Summon from "./Summon";
import ZoneSelect from "./ZoneSelect";
import Zone from "../field/Zone";
import { CardFace, MoveMethod, Place, SummonTiming } from "../../enums";
import CardMoveEvent from "../events/CardMoveEvent";

export default class NormalSummon extends Summon {
  protected static override logger = LoggerFactory.getLogger("NormalSummon");

  constructor(actor: Player, protected monster: Monster) {
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
            new ZoneSelect(this.actor, zone, (zone) =>
              this.normalSummonToZone(zone)
            )
        )
    );
  }

  normalSummonToZone(zone: Zone) {
    Utils.removeItemFromArray(this.actor.hand, this.card);
    zone.card = this.card;
    this.card.visibility = CardFace.Up;
    this.card.turnPositionUpdated = global.DUEL.turn;
    this.getSummonEvent().publish();
    global.DUEL.summon = this;
    global.DUEL.summonTiming = SummonTiming.NegationWindow;
  }

  override toString(): string {
    return `Normal summon ${this.card}`;
  }

  protected getSummonEvent(): CardMoveEvent {
    return new CardMoveEvent(
      this.actor,
      this.monster,
      Place.Hand,
      Place.Field,
      MoveMethod.NormalSummoned
    );
  }
}
