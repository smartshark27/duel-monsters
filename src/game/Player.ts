import { CardFace, BattlePosition, MoveMethod, Phase, Place } from "../enums";
import LoggerFactory from "../utils/LoggerFactory";
import Utils from "../utils/Utils";
import Action from "./Action";
import Draw from "./actions/Draw";
import Pass from "./actions/Pass";
import Card from "./Card";
import Monster from "./cards/Monster";
import Spell from "./cards/Spell";
import Trap from "./cards/Trap";
import Deck from "./Deck";
import DuelEvent from "./DuelEvent";
import CardMoveEvent from "./events/CardMoveEvent";
import Field from "./Field";

export default class Player {
  deck: Deck | undefined;
  extraDeck: Monster[] = [];
  hand: Card[] = [];
  graveyard: Card[] = [];
  normalSummonsRemaining = 0;
  name: string;
  field: Field;
  lifePoints: number = 8000;

  private static logger = LoggerFactory.getLogger("Player");
  private canNormalDraw = false;

  constructor(name: string) {
    this.name = name;
    Player.logger.debug(`Created player ${name}`);
    this.field = new Field(this);
  }

  setDeck(deck: Deck) {
    this.deck = deck;
    this.moveExtraDeckCards();
    deck.shuffle();
  }

  init() {
    for (let i = 0; i < 5; i++) {
      this.drawCard();
    }
  }

  startDrawPhase(): void {
    this.canNormalDraw = true;
  }

  startMainPhase1(): void {
    this.normalSummonsRemaining = 1;
    this.field.resetMonsterAttacksRemaining();
  }

  getSpeed1Actions(events: DuelEvent[] = []): Action[] {
    if (
      this.isTurnPlayer() &&
      global.DUEL.phase === Phase.Draw &&
      this.canNormalDraw
    ) {
      this.canNormalDraw = false;
      return [new Draw(this)];
    }

    return this.getUsableCards().flatMap((card) => card.getActions(1, events));
  }

  getSpeed2Actions(events: DuelEvent[] = []): Action[] {
    return this.getUsableCards().flatMap((card) => card.getActions(2, events));
  }

  getMandatoryTriggeredActions(events: DuelEvent[]): Action[] {
    return this.getUsableCards().flatMap((card) =>
      card.getMandatoryTriggeredActions(events)
    );
  }

  getOptionalTriggeredActions(events: DuelEvent[]): Action[] {
    const actions: Action[] = this.getUsableCards().flatMap((card) =>
      card.getOptionalTriggeredActions(events)
    );
    return actions.length > 0 ? actions.concat(new Pass(this)) : [];
  }

  drawCard(): Card | null {
    Player.logger.debug("Drawing card");
    const card = this.deck?.drawCard();
    if (card) {
      Player.logger.info(`Drew card ${card}`);
      this.hand.push(card);
      return card;
    }
    Player.logger.warn("No cards left to draw");
    global.DUEL.end(global.DUEL.getOpponentOf(this));
    return null;
  }

  canNormalSummonOrSet(tributesRequired: number) {
    return (
      this.isTurnPlayer() &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase) &&
      this.normalSummonsRemaining > 0 &&
      ((tributesRequired === 0 && this.canPlayMonster()) ||
        (tributesRequired > 0 &&
          this.field.getMonsters().length >= tributesRequired))
    );
  }

  canPlayMonster(): boolean {
    return this.field.getFreeMonsterZones().length > 0;
  }

  canPlaySpellTrap(): boolean {
    return this.field.getFreeSpellTrapZones().length > 0;
  }

  isTurnPlayer(): boolean {
    return global.DUEL.turnPlayer === this;
  }

  updateLifePoints(change: number): void {
    Player.logger.debug(
      `Player ${this}'s lifepoints are changing by ${change}`
    );
    this.lifePoints += change;
    this.lifePoints = this.lifePoints < 0 ? 0 : this.lifePoints;
    if (this.lifePoints === 0) {
      global.DUEL.end(global.DUEL.getOpponentOf(this));
    }
  }

  checkHandLimit(): void {
    while (this.hand.length > 6) {
      const card = this.discardRandom();
      new CardMoveEvent(
        this,
        card,
        Place.Hand,
        Place.Graveyard,
        MoveMethod.Discarded
      ).publish();
    }
  }

  getFieldString(): string {
    let str = "|-|";
    for (let i = 0; i < 5; i++) {
      const zone = this.field.monsterZones[i];
      var char = "-";
      if (!zone.isEmpty()) {
        const monster = zone.card as Monster;
        char = monster.position === BattlePosition.Attack ? "a" : "d";
        if (monster.visibility === CardFace.Up) char = char.toUpperCase();
      }
      str += char;
    }
    str += `|${this.graveyard.length}|    ${this} has ${this.lifePoints} lifepoints\n`;
    str += `|${this.extraDeck.length}|`;
    for (let i = 0; i < 5; i++) {
      const card = this.field.spellTrapZones[i].card;
      if (card instanceof Spell && card.visibility === CardFace.Up) str += "S";
      else if (card instanceof Spell) str += "s";
      else if (card instanceof Trap && card.visibility === CardFace.Up)
        str += "T";
      else if (card instanceof Trap) str += "t";
      else str += "-";
    }
    str += `|${this.deck?.cards.length}|   Hand has ${this.hand.length} cards`;
    return str;
  }

  toString(): string {
    return this.name;
  }

  private moveExtraDeckCards(): void {
    if (this.deck) {
      for (var card of this.deck.cards)
        if (card instanceof Monster && card.isExtraDeckType()) {
          this.extraDeck.push(card);
        }

      this.deck.cards = this.deck.cards.filter(
        (card) => !(card instanceof Monster && card.isExtraDeckType())
      );
    }
  }

  private discardRandom(): Card {
    const card = Utils.getRandomItemFromArray(this.hand);
    Player.logger.info(`Discarding ${card}`);
    Utils.removeItemFromArray(this.hand, card);
    this.graveyard.push(card);
    return card;
  }

  private getUsableCards(): Card[] {
    return this.hand.concat(this.field.getCards()).concat(this.graveyard);
  }
}
