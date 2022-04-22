import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import CardAction from "./CardAction";
import Spell from "../cards/Spell";
import SpellTrapZone from "../field/SpellTrapZone";

export default class TrapActivation extends CardAction {
  protected static logger = LoggerFactory.getLogger("TrapActivation");

  constructor(actor: Player, card: Spell, private zone: SpellTrapZone) {
    super(actor, card);
  }

  override perform() {
    TrapActivation.logger.info(`Activating trap ${this.card}`);
    this.card.activate();
  }

  override finalise() {
    this.card.sendToGraveyard();
  }

  override toString(): string {
    return `Activate ${this.card}`;
  }
}
