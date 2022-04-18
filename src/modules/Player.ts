import { Phase } from "../enums";
import LoggerFactory from "../util/LoggerFactory";
import Util from "../util/Util";
import Action from "./actions/Action";
import Card from "./Card";
import Deck from "./Deck";
import Field from "./Field";

export default class Player {
  hand: Card[] = [];
  graveyard: Card[] = [];
  havingTurn: boolean = false;
  normalSummonsRemaining = 0;
  name: string;
  field: Field;

  private static logger = LoggerFactory.getLogger("Player");
  private lifePoints: number = 8000;
  private extraDeck: Card[] = [];
  private deck: Deck | undefined;

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
      Player.logger.info(`Drew card ${card}`);
      this.hand.push(card);
    } else {
      Player.logger.warn("No cards left to draw");
      global.DUEL.end(global.DUEL.getInactivePlayer());
    }
  }

  startDrawPhase() {
    Player.logger.info(`Starting draw phase for player ${this}`);
    this.drawCard();
  }

  startMainPhase1() {
    Player.logger.info(`Starting main phase 1 for player ${this}`);
    this.normalSummonsRemaining++;
  }

  startBattlePhase() {
    Player.logger.info(`Starting battle phase for player ${this}`);
    this.field
      .getMonsters()
      .forEach((monster) => (monster.attacksRemaining = 1));
  }

  startMainPhase2() {
    Player.logger.info(`Starting main phase 2 for player ${this}`);
  }

  startEndPhase() {
    Player.logger.info(`Starting end phase for player ${this}`);
    this.normalSummonsRemaining = 0;
    while (this.hand.length > 6) {
      this.discardRandom();
    }
  }

  getActions(): Action[] {
    const actions = this.getHandActions().concat(this.getFieldActions());
    Player.logger.debug(`Player ${this} has ${actions.length} actions`);
    return actions;
  }

  canNormalSummon() {
    const result: boolean =
      this.havingTurn &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase) &&
      this.normalSummonsRemaining > 0 &&
      this.field.getFreeMonsterZones().length > 0;
    return result;
  }

  receiveBattleDamage(damage: number): void {
    Player.logger.info(`Inflicting ${damage} battle damage to ${this}`);
    this.reduceLifePoints(damage);
  }

  discardRandom() {
    Player.logger.info("Discarding card");
    const card = Util.getRandomItemFromArray(this.hand);
    this.graveyard.push(card);
    Util.removeItemFromArray(this.hand, card);
  }

  getFieldString() {
    return `|-|${this.field}|${this.graveyard.length}|    ${this} has ${this.lifePoints} lifepoints`;
  }

  toString() {
    return this.name;
  }

  private getHandActions(): Action[] {
    return this.hand.flatMap((card) => card.getActions());
  }

  private getFieldActions(): Action[] {
    return this.field.getCards().flatMap((card) => card.getActions());
  }

  private reduceLifePoints(damage: number): void {
    this.lifePoints -= damage;
    this.lifePoints = this.lifePoints < 0 ? 0 : this.lifePoints;
    Player.logger.info(`Player ${this} has ${this.lifePoints} life points remaining`);
    this.checkLifePointsLoss();
  }

  private checkLifePointsLoss(): void {
    if (this.lifePoints === 0) {
      global.DUEL.end(global.DUEL.getInactivePlayer());
    }
  }
}
