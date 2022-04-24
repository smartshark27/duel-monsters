import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import ContinuousTrapActivation from "../actions/ContinuousTrapActivation";
import Trap from "./Trap";

export default class ContinuousTrap extends Trap {
  protected static override logger = LoggerFactory.getLogger("ContinuousTrap");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }

  protected override getActivationAction(): ContinuousTrapActivation {
    return new ContinuousTrapActivation(this.controller, this);
  }
}
