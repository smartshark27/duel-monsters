import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import CardAction from "./CardAction";
import Effect from "../Effect";

export default class Activation extends CardAction {
  protected static logger = LoggerFactory.getLogger("Activation");

  constructor(actor: Player, private effect: Effect) {
    super(actor, effect.card);
  }

  override perform() {
    Activation.logger.info(`Activating effect of ${this.card}`);
    this.effect.activate();
  }

  override finalise() {
    Activation.logger.info(`Resolving effect of ${this.card}`);
    this.effect.resolve();
  }

  override toString(): string {
    return `Activate ${this.card}`;
  }
}
