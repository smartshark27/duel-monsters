import LoggerFactory from "../utils/LoggerFactory";
import Utils from "../utils/Utils";
import Card from "./Card";
import Player from "./Player";

export default class Deck {
  private static logger = LoggerFactory.getLogger("Duel");

  constructor(public cards: Card[]) {}

  shuffle() {
    Deck.logger.debug("Shuffling deck");
    Utils.shuffleArray(this.cards);
  }

  drawCard() {
    return this.cards.pop();
  }

  shuffleCardInto(card: Card): void {
    this.cards.push(card);
    this.shuffle();
  }
}
