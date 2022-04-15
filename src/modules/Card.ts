import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";
import File from "../util/File";

export default class Card {
  name: string;

  protected static logger = LoggerFactory.getLogger("Card");
  protected static cardsData = JSON.parse(File.read("./cards/cards.json"));
  protected data: MonsterData;
  private owner: Player;

  protected static getCardData(name: string) {
    return Card.cardsData[name];
  }

  constructor(owner: Player, name: string) {
    Card.logger.debug(`Creating card ${name}`);

    this.owner = owner;
    this.name = name;
    this.data = Card.getCardData(name);
  }
}
