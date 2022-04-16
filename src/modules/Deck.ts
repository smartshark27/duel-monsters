import CardData from "../interfaces/CardData";
import { CardType } from "../enums";
import File from "../util/File";
import LoggerFactory from "../util/LoggerFactory";
import Util from "../util/Util";
import Card from "./Card";
import Monster from "./Monster";
import Player from "./Player";

export default class Deck {
  private static logger = LoggerFactory.getLogger("Duel");
  private static cardsData = JSON.parse(File.read("./cards/cards.json"));
  private owner: Player;
  private name: string;
  private cards: Card[] = [];

  constructor(owner: Player, name: string) {
    Deck.logger.info(`Creating deck ${name}`);
    this.owner = owner;
    this.name = name;
    this.loadCards();
  }

  shuffle() {
    Deck.logger.info("Shuffling deck");
    Util.shuffleArray(this.cards);
  }

  drawCard() {
    return this.cards.pop();
  }

  private loadCards() {
    const filename = "./decks/" + this.name + ".txt";
    Deck.logger.debug(`Loading cards from ${filename}`);
    const file = File.read(filename);
    const cardNames = file.split("\n");
    Deck.logger.debug("Loaded cards " + cardNames);
    cardNames.forEach((cardName) => {
      const cardData = this.getCardData(cardName);
      if (cardData.cardType === CardType.Monster) {
        this.cards.push(new Monster(this.owner, cardName, cardData));
      }
    });
  }

  private getCardData(name: string): CardData {
    return Deck.cardsData[name];
  }
}
