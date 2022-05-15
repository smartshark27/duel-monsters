import LoggerFactory from "../../utils/LoggerFactory";
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

  override resolve(): void {
    ActivationEffect.logger.info(`Resolving ${this}`);
  }
}
