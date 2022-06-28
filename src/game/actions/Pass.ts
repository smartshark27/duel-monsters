import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Action from "../Action";

export default class Pass extends Action {
  protected static override logger = LoggerFactory.getLogger("Pass");

  constructor(actor: Player) {
    super(actor);
  }

  toString(): string {
    return "Pass";
  }
}
