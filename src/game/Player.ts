import { Phase } from "../enums";
import LoggerFactory from "../util/LoggerFactory";
import Util from "../util/Util";
import Action from "./Action";
import EndPhase from "./actions/EndPhase";
import Card from "./Card";
import Spell from "./cards/Spell";
import Trap from "./cards/Trap";
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
  }

  startMainPhase2() {
    Player.logger.info(`Starting main phase 2 for player ${this}`);
  }

  startEndPhase() {
    Player.logger.info(`Starting end phase for player ${this}`);
    this.normalSummonsRemaining = 0;
    this.field
      .getMonsters()
      .forEach((monster) => (monster.attacksRemaining = 1));
    while (this.hand.length > 6) {
      this.discardRandom();
    }
  }

  getSpeed1Actions(): Action[] {
    return this.getSpeed2Actions()
      .concat(this.hand.flatMap((card) => card.getSpeed1Actions()))
      .concat(this.field.getCards().flatMap((card) => card.getSpeed1Actions()))
      .concat(new EndPhase(this));
  }

  getSpeed2Actions(): Action[] {
    // TODO: Add ignore action
    return this.field.getCards().flatMap((card) => card.getSpeed2Actions());
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
    const card = Util.getRandomItemFromArray(this.hand);
    this.graveyard.push(card);
    Util.removeItemFromArray(this.hand, card);
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
      const zone = this.field.spellTrapZones[i];
      if (zone.card instanceof Spell) {
        str += "S";
      } else if (zone.card instanceof Trap) {
        str += "T";
      } else {
        str += "-";
      }
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
