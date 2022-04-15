import LoggerFactory from "../util/LoggerFactory";

export default class Card {
  private static logger = LoggerFactory.getLogger("Card");
  private name: String;

  constructor(name: String) {
    Card.logger.debug(`Creating card ${name}`);

    this.name = name;
  }
}
