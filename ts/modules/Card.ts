import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";

export default class Card {
  private static logger = LoggerFactory.getLogger("Card");
  private owner: Player;
  private name: String;

  constructor(owner: Player, name: String) {
    Card.logger.debug(`Creating card ${name}`);

    this.owner = owner;
    this.name = name;
  }
}
