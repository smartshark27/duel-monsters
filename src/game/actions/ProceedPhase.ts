import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Action from "../Action";

export default class ProceedPhase extends Action {
  protected static logger = LoggerFactory.getLogger("ProceedPhase");

  constructor(actor: Player) {
    super(actor);
  }

  toString(): string {
    return "Proceed Phase";
  }
}
