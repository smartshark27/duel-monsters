import LoggerFactory from "../util/LoggerFactory";
import Card from "./Card";
import Deck from "./Deck";
import Field from "./Field";

export default class Player {
  name: string;

  private static logger = LoggerFactory.getLogger("Player");
  private lifePoints: number = 8000;
  private hand: Card[] = [];
  private graveyard: Card[] = [];
  private extraDeck: Card[] = [];
  private deck: Deck | undefined;
  private field: Field;

  constructor(name: string) {
    this.name = name;
    Player.logger.info(`Created player ${name}`);
    this.field = new Field(this);
  }

  setDeck(deck: Deck) {
    deck.shuffle();
    this.deck = deck;
    // TODO: Move extra deck cards to extra deck
  }

  init() {
    for (let i = 0; i < 5; i++) {
      this.drawCard();
    }
  }

  drawCard() {
    Player.logger.debug("Drawing card");
    const card = this.deck?.drawCard();
    if (card) {
      Player.logger.info(`Drew card ${card.name}`);
      this.hand.push(card);
    } else {
      Player.logger.warn("No cards left to draw");
      global.DUEL.end(global.DUEL.getInactivePlayer());
    }
  }

  startDrawPhase() {
    Player.logger.info(`Starting turn for player ${this.name}`);
    this.drawCard();
  }

  startMainPhase1() {
    Player.logger.info(`Starting main phase for player ${this.name}`);
    const actions = this.getActions();
  }

  getActions() {
    const handActions = this.getHandActions();
    return handActions;
  }

  private getHandActions() {
    const actions: Card[] = [];
    this.hand.forEach(card => {
      if (card.getActions()) {
        actions.push(card);
      }
    })
  }
}
