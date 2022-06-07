import LoggerFactory from "../utils/LoggerFactory";
import Player from "./Player";

export default class DuelEvent {
  protected static logger = LoggerFactory.getLogger("DuelEvent");

  constructor(public actor: Player) {}

  publish(): void {
    DuelEvent.logger.info(this);
    global.DUEL.queuedEvents.push(this);
  }

  toString(): string {
    DuelEvent.logger.error("toString() not implemented for subclass of Event");
    return "";
  }
}
