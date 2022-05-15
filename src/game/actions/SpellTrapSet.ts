import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import CardAction from "./CardAction";
import Spell from "../cards/Spell";
import SpellTrapZone from "../field/SpellTrapZone";
import Utils from "../../utils/Utils";
import Trap from "../cards/Trap";

export default class SpellTrapSet extends CardAction {
  protected static logger = LoggerFactory.getLogger("SpellTrapSet");

  constructor(
    actor: Player,
    card: Spell | Trap,
    private zone: SpellTrapZone
  ) {
    super(actor, card);
  }

  override perform() {
    super.perform();
    SpellTrapSet.logger.info(`Setting ${this.card}`);
    this.card.set();
    this.zone.card = this.card;
    Utils.removeItemFromArray(this.actor.hand, this.card);
  }

  override toString(): string {
    return `Set ${this.card}`;
  }
}
