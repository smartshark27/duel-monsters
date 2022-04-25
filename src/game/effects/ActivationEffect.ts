import LoggerFactory from "../../util/LoggerFactory";
import Card from "../Card";
import Effect from "../Effect";

export default class ActivationEffect extends Effect {
  protected static logger = LoggerFactory.getLogger("ActivationEffect");

  constructor(card: Card, speed: number) {
    super(card, speed);
  }

  canActivate(): boolean {
    return true;
  }

  activate(): void {}

  resolve(): void {}

  after(): void {}

  toString(): string {
    return this.card.getName() + "effect";
  }
}
