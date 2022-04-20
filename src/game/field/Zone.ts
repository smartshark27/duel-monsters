import LoggerFactory from "../../util/LoggerFactory";
import Card from "../Card";
import Player from "../Player";

export default class Zone {
  card: Card | undefined | null;

  protected static logger = LoggerFactory.getLogger("Zone");

  constructor(protected owner: Player) {}

  isEmpty() {
    return !this.card;
  }
}
