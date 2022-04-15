import File from "../util/File";
import LoggerFactory from "../util/LoggerFactory";
import Util from "../util/Util";
import Card from "./Card";
import Player from "./Player";

export default class Deck {
  private static logger = LoggerFactory.getLogger("Duel");
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
    cardNames.forEach((cardName) =>
      this.cards.push(new Card(this.owner, cardName))
    );
  }
}
