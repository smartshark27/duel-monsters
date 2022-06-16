import LoggerFactory from "../utils/LoggerFactory";
import DuelEvent from "./DuelEvent";

export default class EventManager {
  protected static logger = LoggerFactory.getLogger("EventManager");
  allEvents: DuelEvent[] = [];
  queuedEvents: DuelEvent[] = [];
  lastEvents: DuelEvent[] = [];

  push(event: DuelEvent): void {
    this.allEvents.push(event);
    this.queuedEvents.push(event);
    this.lastEvents.push(event);
  }

  clearQueuedEvents(): void {
    this.queuedEvents = [];
    this.clearLastEvents();
  }

  clearLastEvents(): void {
    this.lastEvents = [];
  }
}
