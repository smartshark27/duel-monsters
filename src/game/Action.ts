import LoggerFactory from "../utils/LoggerFactory";
import Player from "./Player";

export default class Action {
  protected static logger = LoggerFactory.getLogger("Action");
  isFromActivation = false;

  constructor(public actor: Player) {}

  perform(): void {
    Action.logger.info(`Performing action ${this}`)
  }

  toString(): string {
    Action.logger.error("toString() not implemented for subclass of Action");
    return "";
  }
}
