import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import CardAction from "./CardAction";
import Trap from "../cards/Trap";

export default class TrapActivation extends CardAction {
  protected static logger = LoggerFactory.getLogger("TrapActivation");

  constructor(actor: Player, card: Trap) {
    super(actor, card);
  }

  override perform() {
    TrapActivation.logger.info(`Activating trap ${this.card}`);
    this.card.activate();
  }

  override finalise() {
    TrapActivation.logger.info(`Resolving trap ${this.card}`);
    this.card.resolve();
  }

  override toString(): string {
    return `Activate ${this.card}`;
  }
}
