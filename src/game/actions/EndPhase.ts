import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Action from "../Action";

export default class EndPhase extends Action {
  protected static logger = LoggerFactory.getLogger("EndPhase");

  constructor(actor: Player) {
    super(actor);
  }

  override finalise(): void {
    global.DUEL.startNextPhase();
  }

  override toString(): string {
    return `End current phase`;
  }
}
