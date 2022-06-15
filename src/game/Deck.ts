import CardData from "../interfaces/CardData";
import { CardType } from "../enums";
import File from "../utils/File";
import LoggerFactory from "../utils/LoggerFactory";
import Utils from "../utils/Utils";
import Card from "./Card";
import Monster from "./cards/Monster";
import Player from "./Player";
import Trap from "./cards/Trap";
import Spell from "./cards/Spell";

export default class Deck {
  cards: Card[] = [];
  private static logger = LoggerFactory.getLogger("Duel");
  private static cardsData = JSON.parse(File.read("./cards/cards.json"));

  constructor(private owner: Player, private name: string) {
    Deck.logger.info(`Creating deck ${name}`);
    this.loadCards();
  }

  shuffle() {
    Deck.logger.info("Shuffling deck");
    Utils.shuffleArray(this.cards);
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
      } else if (cardData.cardType === CardType.Spell) {
        this.cards.push(new Spell(this.owner, cardName, cardData));
      } else if (cardData.cardType === CardType.Trap) {
        this.cards.push(new Trap(this.owner, cardName, cardData));
      }
    });
  }

  private getCardData(name: string): CardData {
    return Deck.cardsData[name];
  }
}
