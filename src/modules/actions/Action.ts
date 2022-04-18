import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";

export default class Action {
  protected static logger = LoggerFactory.getLogger("Action");

  constructor(protected actor: Player) {}

  perform(): void {}

  toString(): string {
    Action.logger.error("toString() not implemented for subclass of Action");
    return "";
  }
}
