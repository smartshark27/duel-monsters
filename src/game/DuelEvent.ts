import LoggerFactory from "../utils/LoggerFactory";
import Action from "./Action";

export default class DuelEvent {
  protected static logger = LoggerFactory.getLogger("Event");

  constructor(public action: Action) {}

  toString(): string {
    DuelEvent.logger.error("toString() not implemented for subclass of Event");
    return "";
  }
}
