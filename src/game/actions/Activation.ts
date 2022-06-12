import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import ActivationEffect from "../effects/ActivationEffect";
import Action from "../Action";

export default class Activation extends Action {
  protected static logger = LoggerFactory.getLogger("Activation");

  constructor(actor: Player, public effect: ActivationEffect) {
    super(actor);
  }

  override perform() {
    super.perform();
    Activation.logger.info(`Activating effect of ${this.effect.card}`);
    global.DUEL.chain.addLink(this.effect);
    this.effect.activate();
  }

  override toString(): string {
    return `Activate ${this.effect.card}`;
  }
}
