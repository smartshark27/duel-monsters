import LoggerFactory from "../utils/LoggerFactory";
import Player from "./Player";

export default class DuelEvent {
  turn: number;
  protected static logger = LoggerFactory.getLogger("DuelEvent");

  constructor(public actor: Player) {
    this.turn = global.DUEL.turn;
  }

  publish(): void {
    DuelEvent.logger.info(this);
    global.DUEL.eventManager.push(this);
  }

  toString(): string {
    DuelEvent.logger.error("toString() not implemented for subclass of Event");
    return "";
  }
}
