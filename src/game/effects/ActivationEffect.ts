import LoggerFactory from "../../utils/LoggerFactory";
import Activation from "../actions/Activation";
import Card from "../Card";
import Effect from "../Effect";

export default class ActivationEffect extends Effect {
  protected static logger = LoggerFactory.getLogger("ActivationEffect");

  constructor(card: Card, speed: number) {
    super(card, speed);
  }

  canActivate(): boolean {
    return !global.DUEL.chain.includes(this);
  }

  getActivationActions(): Activation[] {
    return [];
  }

  resolve(): void {}
}
