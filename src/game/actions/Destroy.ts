import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Effect from "../Effect";
import CardAction from "./CardAction";
import Card from "../Card";

export default class Destroy extends CardAction {
  protected static override logger = LoggerFactory.getLogger("Destroy");

  constructor(actor: Player, card: Card, private effect: Effect) {
    super(actor, card);
  }

  override perform(): void {
    Destroy.logger.info(`Destroying ${this.card}`);
    this.card.destroy();
  }

  override finalise(): void {
    this.effect.after();
  }

  override toString(): string {
    return `Destroy ${this.card}`;
  }
}
