import { State } from "../enums";
import LoggerFactory from "../utils/LoggerFactory";
import DuelEvent from "./DuelEvent";

export default class EventManager {
  protected static logger = LoggerFactory.getLogger("EventManager");
  queuedEvents: DuelEvent[] = [];
  openEvents: DuelEvent[] = [];
  lastEvents: DuelEvent[] = [];

  push(event: DuelEvent): void {
    this.queuedEvents.push(event);
    this.lastEvents.push(event);
    if (global.DUEL.state === State.Open) this.openEvents.push(event);
  }

  getRespondableEvents(): DuelEvent[] {
    return [...new Set(this.lastEvents.concat(this.openEvents))];
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
    return `Events: queued: ${this.queuedEvents.length}, last: ${this.lastEvents.length}, open: ${this.openEvents.length}`;
  }
}
