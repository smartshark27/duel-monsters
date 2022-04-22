import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Action from "../Action";

export default class EndPhase extends Action {
  protected static logger = LoggerFactory.getLogger("EndPhase");

  constructor(actor: Player) {
    super(actor);
  }

  finalise(): void {
    global.DUEL.startNextPhase();
  }

  toString(): string {
    return `End current phase`;
  }
}
