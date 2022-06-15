import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Utils from "../../utils/Utils";
import ZoneSelect from "./ZoneSelect";
import Zone from "../field/Zone";
import { CardFace, MoveMethod, Place } from "../../enums";
import CardMoveEvent from "../events/CardMoveEvent";
import Action from "../Action";
import Trap from "../cards/Trap";
import Spell from "../cards/Spell";

export default class SpellTrapSet extends Action {
  protected static override logger = LoggerFactory.getLogger("SpellTrapSet");

  constructor(actor: Player, protected card: Spell | Trap) {
    super(actor);
  }

  override perform(): void {
    super.perform();
    this.setActionSelection(
      this.actor.field
        .getFreeSpellTrapZones()
        .map(
          (zone) =>
            new ZoneSelect(this.actor, zone, (zone) => this.setToZone(zone))
        )
    );
  }

  setToZone(zone: Zone) {
    Utils.removeItemFromArray(this.actor.hand, this.card);
    zone.card = this.card;
    this.card.visibility = CardFace.Down;
    this.card.set();
    this.getSetEvent().publish();
  }

  override toString(): string {
    return `Set ${this.card}`;
  }

  protected getSetEvent(): CardMoveEvent {
    return new CardMoveEvent(
      this.actor,
      this.card,
      Place.Hand,
      Place.Field,
      MoveMethod.Set
    );
  }
}
