import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import CardAction from "./CardAction";
import Spell from "../cards/Spell";
import SpellTrapZone from "../field/SpellTrapZone";
import Util from "../../util/Util";
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
    SpellTrapSet.logger.info(`Setting ${this.card}`);
    this.card.set();
    this.zone.card = this.card;
    Util.removeItemFromArray(this.actor.hand, this.card);
  }

  override toString(): string {
    return `Set ${this.card}`;
  }
}
