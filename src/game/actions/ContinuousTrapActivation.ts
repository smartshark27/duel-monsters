import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Trap from "../cards/Trap";
import NormalTrapActivation from "./NormalTrapActivation";

export default class ContinuousTrapActivation extends NormalTrapActivation {
  protected static logger = LoggerFactory.getLogger("ContinuousTrapActivation");

  constructor(actor: Player, card: Trap) {
    super(actor, card);
  }
}
