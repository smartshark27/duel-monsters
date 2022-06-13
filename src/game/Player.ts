import { CardFace, MonsterPosition, Phase, SummonTiming } from "../enums";
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
import Field from "./Field";

export default class Player {
  hand: Card[] = [];
  graveyard: Card[] = [];
  normalSummonsRemaining = 0;
  name: string;
  field: Field;

  private static logger = LoggerFactory.getLogger("Player");
  private canNormalDraw = false;
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

  startDrawPhase(): void {
    this.canNormalDraw = true;
  }

  startMainPhase1(): void {
    this.normalSummonsRemaining = 1;
  }

  startBattlePhase(): void {
    this.field.resetMonsterAttacksRemaining();
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

  getSpeed1Actions(): Action[] {
    if (
      this.isTurnPlayer() &&
      global.DUEL.phase === Phase.Draw &&
      this.canNormalDraw
    ) {
      this.canNormalDraw = false;
      return [new Draw(this)];
    }

    return this.getSpeed2Actions()
      .concat(this.hand.flatMap((card) => card.getSpeed1Actions()))
      .concat(this.field.getCards().flatMap((card) => card.getSpeed1Actions()));
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
    return actions.length > 0 ? actions.concat(new Pass(this)) : [];
  }

  canNormalSummon(tributesRequired: number) {
    return (
      this.isTurnPlayer() &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase) &&
      !global.DUEL.isDuringTiming() &&
      this.normalSummonsRemaining > 0 &&
      ((tributesRequired === 0 &&
        this.field.getFreeMonsterZones().length > 0) ||
        this.field.getMonsters().length >= tributesRequired)
    );
  }

  canPlaySpellTrap() {
    return this.field.getFreeSpellTrapZones().length > 0;
  }

  discardRandom(): void {
    Player.logger.info("Discarding card");
    const card = Utils.getRandomItemFromArray(this.hand);
    this.graveyard.push(card);
    Utils.removeItemFromArray(this.hand, card);
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
    Player.logger.info(
      `Player ${this} has ${this.lifePoints} life points remaining`
    );
    if (this.lifePoints === 0) {
      global.DUEL.end(global.DUEL.getOpponentOf(this));
    }
  }

  getFieldString(): string {
    let str = "|-|";
    for (let i = 0; i < 5; i++) {
      const zone = this.field.monsterZones[i];
      var char = "-";
      if (!zone.isEmpty()) {
        const monster = zone.card as Monster;
        char = monster.position === MonsterPosition.Attack ? "a" : "d";
        if (monster.visibility === CardFace.Up) char = char.toUpperCase();
      }
      str += char;
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

  toString(): string {
    return this.name;
  }
}
