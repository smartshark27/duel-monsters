import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import CardAction from "./CardAction";
import Card from "../Card";

export default class Activation extends CardAction {
  protected static logger = LoggerFactory.getLogger("SpellActivation");

  constructor(actor: Player, card: Card) {
    super(actor, card);
  }

  override perform() {
    this.card.activate();
  }

  override finalise() {
    Activation.logger.info(`Resolving effect of ${this.card}`);
    this.card.resolve();
  }

  override toString(): string {
    return `Activate ${this.card}`;
  }
}
