import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Player from "../Player";

export default class Zone {
  card: Card | undefined | null;

  protected static logger = LoggerFactory.getLogger("Zone");

  constructor(protected owner: Player) {}

  isEmpty(): boolean {
    return !this.card;
  }

  toString(): string {
    Zone.logger.error("toString() not implemented for subclass of Zone");
    return "";
  }
}
