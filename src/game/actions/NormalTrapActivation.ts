import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Trap from "../cards/Trap";
import Activation from "./Activation";

export default class NormalTrapActivation extends Activation {
  protected static logger = LoggerFactory.getLogger("NormalTrapActivation");

  constructor(actor: Player, card: Trap) {
    super(actor, card);
  }

  override perform() {
    NormalTrapActivation.logger.info(`Activating trap ${this.card}`);
    super.perform();
  }
}
