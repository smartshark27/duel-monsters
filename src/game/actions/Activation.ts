import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import CardAction from "./CardAction";
import ActivationEffect from "../effects/ActivationEffect";

export default class Activation extends CardAction {
  protected static logger = LoggerFactory.getLogger("Activation");
  override isFromActivation = true;

  constructor(actor: Player, public effect: ActivationEffect) {
    super(actor, effect.card);
  }

  override perform() {
    super.perform();
    Activation.logger.info(`Activating effect of ${this.card}`);
    global.DUEL.chain.addLink(this.effect);
    this.effect.activate();
  }

  override toString(): string {
    return `Activate ${this.card}`;
  }
}
