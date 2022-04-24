import CardData from "../interfaces/CardData";
import { CardType, SpellType, TrapType } from "../enums";
import File from "../util/File";
import LoggerFactory from "../util/LoggerFactory";
import Util from "../util/Util";
import Card from "./Card";
import Monster from "./cards/Monster";
import Player from "./Player";
import NormalSpell from "./cards/NormalSpell";
import Trap from "./cards/Trap";

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
      } else if (cardData.cardType === CardType.Spell) {
        if (cardData.spellType === SpellType.Normal) {
          this.cards.push(new NormalSpell(this.owner, cardName, cardData));
        }
      } else if (cardData.cardType === CardType.Trap) {
        if (cardData.trapType === TrapType.Normal) {
          this.cards.push(new Trap(this.owner, cardName, cardData));
        }
      }
    });
  }

  private getCardData(name: string): CardData {
    return Deck.cardsData[name];
  }
}
