import File from "../utils/File";
import LoggerFactory from "../utils/LoggerFactory";
import Player from "./Player";
import { CardType } from "../enums";
import Card from "./Card";
import Monster from "./cards/Monster";
import Spell from "./cards/Spell";
import Trap from "./cards/Trap";

export default class CardLoader {
  protected static logger = LoggerFactory.getLogger("CardLoader");
  private static cardsData = JSON.parse(File.read("./cards/cards.json"));

  static load(name: string, owner: Player): Card {
    const cardData = this.cardsData[name];
    if (cardData.cardType === CardType.Monster) {
      return new Monster(owner, name, cardData);
    } else if (cardData.cardType === CardType.Spell) {
      return new Spell(owner, name, cardData);
    } else {
      return new Trap(owner, name, cardData);
    }
  }
}
