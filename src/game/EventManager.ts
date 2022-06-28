import { State } from "../enums";
import LoggerFactory from "../utils/LoggerFactory";
import Utils from "../utils/Utils";
import DuelEvent from "./DuelEvent";

export default class EventManager {
  protected static logger = LoggerFactory.getLogger("EventManager");
  turnEvents: DuelEvent[] = [];
  queuedEvents: DuelEvent[] = [];
  openEvents: DuelEvent[] = [];
  lastEvents: DuelEvent[] = [];

  push(event: DuelEvent): void {
    this.turnEvents.push(event);
    this.queuedEvents.push(event);
    this.lastEvents.push(event);
    if (global.DUEL.state === State.Open) this.openEvents.push(event);
  }

  getRespondableEvents(): DuelEvent[] {
    return [...new Set(this.lastEvents.concat(this.openEvents))];
  }

  negate(event: DuelEvent): void {
    Utils.removeItemFromArray(this.turnEvents, event);
    Utils.removeItemFromArray(this.queuedEvents, event);
    Utils.removeItemFromArray(this.lastEvents, event);
    Utils.removeItemFromArray(this.openEvents, event);
  }

  clearTurnEvents(): void {
    this.turnEvents = [];
  }

  clearQueuedEvents(): void {
    this.queuedEvents = [];
  }

  clearOpenEvents(): void {
    this.openEvents = [];
  }

  clearLastEvents(): void {
    this.lastEvents = [];
  }

  toString(): string {
    return `Events: turn: ${this.turnEvents.length}, queued: ${this.queuedEvents.length}, last: ${this.lastEvents.length}, open: ${this.openEvents.length}`;
  }
}
