import { CardFace } from "../enums";
import LoggerFactory from "../utils/LoggerFactory";
import Utils from "../utils/Utils";
import Action from "./Action";
import ActionSelector from "./actions/ActionSelector";
import Activation from "./actions/Activation";
import Pass from "./actions/Pass";
import ProceedPhase from "./actions/ProceedPhase";
import Card from "./Card";
import Spell from "./cards/Spell";
import Trap from "./cards/Trap";
import Deck from "./Deck";
import DuelEvent from "./DuelEvent";
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
  private deck: Deck | undefined;

  constructor(name: string) {
    this.name = name;
    Player.logger.info(`Created player ${name}`);
    this.field = new Field(this);
  }

  setDeck(deck: Deck) {
    deck.shuffle();
    this.deck = deck;
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
      global.DUEL.end(global.DUEL.getOpponentOf(this));
    }
  }

  getSpeed1Actions(): Action[] {
    return this.getSpeed2Actions()
      .concat(this.hand.flatMap((card) => card.getSpeed1Actions()))
      .concat(this.field.getCards().flatMap((card) => card.getSpeed1Actions()))
      .concat(new ProceedPhase(this));
  }

  getSpeed2Actions(): Action[] {
    return this.hand
      .concat(this.field.getCards())
      .flatMap((card) => card.getSpeed2Actions());
  }

  getMandatoryTriggeredActions(events: DuelEvent[]): Action[] {
    return this.field
      .getCards()
      .flatMap((card) => card.getMandatoryTriggeredActions(events));
  }

  getOptionalTriggeredActions(events: DuelEvent[]): Action[] {
    const actions: Action[] = this.field
      .getCards()
      .flatMap((card) => card.getOptionalTriggeredActions(events));
    if (ActionSelector.length > 0) actions.concat(new Pass(this));
    return actions;
  }

  canNormalSummon() {
    return (
      this.havingTurn &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase) &&
      this.normalSummonsRemaining > 0 &&
      this.field.getFreeMonsterZones().length > 0
    );
  }

  canTributeSummon(tributesRequired: number) {
    return (
      this.canNormalSummon() &&
      this.field.getMonsters().length >= tributesRequired
    );
  }

  canPlaySpellTrap() {
    return this.field.getFreeSpellTrapZones().length > 0;
  }

  canSetSpellTrap() {
    return (
      this.canPlaySpellTrap() &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase)
    );
  }

  receiveBattleDamage(damage: number): void {
    Player.logger.info(`Inflicting ${damage} battle damage to ${this}`);
    this.reduceLifePoints(damage);
  }

  discardRandom() {
    Player.logger.info("Discarding card");
    const card = Utils.getRandomItemFromArray(this.hand);
    this.graveyard.push(card);
    Utils.removeItemFromArray(this.hand, card);
  }

  getFieldString() {
    let str = "|-|";
    for (let i = 0; i < 5; i++) {
      const zone = this.field.monsterZones[i];
      str += zone.isEmpty() ? "-" : "M";
    }
    str += `|${this.graveyard.length}|    ${this} has ${this.lifePoints} lifepoints\n`;
    str += `|-|`;
    for (let i = 0; i < 5; i++) {
      const card = this.field.spellTrapZones[i].card;
      if (card instanceof Spell && card.visibility === CardFace.Up) str += "S";
      else if (card instanceof Spell) str += "s";
      else if (card instanceof Trap && card.visibility === CardFace.Up)
        str += "T";
      else if (card instanceof Trap) str += "t";
      else str += "-";
    }
    str += `|${this.deck?.cards.length}|`;
    return str;
  }

  toString() {
    return this.name;
  }

  private reduceLifePoints(damage: number): void {
    this.lifePoints -= damage;
    this.lifePoints = this.lifePoints < 0 ? 0 : this.lifePoints;
    Player.logger.info(
      `Player ${this} has ${this.lifePoints} life points remaining`
    );
    this.checkLifePointsLoss();
  }

  private checkLifePointsLoss(): void {
    if (this.lifePoints === 0) {
      global.DUEL.end(global.DUEL.getOpponentOf(this));
    }
  }
}
