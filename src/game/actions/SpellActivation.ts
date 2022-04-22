import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import CardAction from "./CardAction";
import Spell from "../cards/Spell";
import SpellTrapZone from "../field/SpellTrapZone";
import Util from "../../util/Util";

export default class SpellActivation extends CardAction {
  protected static logger = LoggerFactory.getLogger("SpellActivation");

  constructor(actor: Player, card: Spell, private zone: SpellTrapZone) {
    super(actor, card);
  }

  override perform() {
    SpellActivation.logger.info(`Activating spell ${this.card}`);
    this.zone.card = this.card;
    Util.removeItemFromArray(this.actor.hand, this.card);
    this.card.activate();
  }

  override finalise() {
    this.card.resolve();
  }

  override toString(): string {
    return `Activate ${this.card}`;
  }
}
