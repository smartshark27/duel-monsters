import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";

export default class Action {
  protected static logger = LoggerFactory.getLogger("Action");

  constructor(public actor: Player) {}

  perform(): void {}

  finalise(): void {}

  canBeChainedOnto(): boolean {
    return true;
  }

  toString(): string {
    Action.logger.error("toString() not implemented for subclass of Action");
    return "";
  }
}
