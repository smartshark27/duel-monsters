import LoggerFactory from "../../utils/LoggerFactory";
import Activation from "../actions/Activation";
import Card from "../Card";
import Effect from "../Effect";

export default class ActivationEffect extends Effect {
  protected static logger = LoggerFactory.getLogger("ActivationEffect");

  constructor(card: Card, speed: number) {
    super(card, speed);
  }

  resolve(): void {}

  getActivationActions(): Activation[] {
    return [];
  }

  protected canActivate(): boolean {
    return !global.DUEL.chain.includes(this);
  }
}
