import LoggerFactory from "../utils/LoggerFactory";
import Player from "./Player";

export default class Action {
  protected static logger = LoggerFactory.getLogger("Action");

  constructor(public actor: Player) {}

  perform(): void {
    Action.logger.info(`Performing action ${this}`);
  }

  toString(): string {
    Action.logger.error("toString() not implemented for subclass of Action");
    return "";
  }

  protected setActionSelection(actionSelection: Action[]) {
    global.DUEL.actionSelection = actionSelection;
  }
}
