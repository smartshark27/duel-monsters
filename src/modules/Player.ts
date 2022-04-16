import { Phase } from "../enums";
import LoggerFactory from "../util/LoggerFactory";
import Util from "../util/Util";
import Action from "./actions/Action";
import Card from "./Card";
import Deck from "./Deck";
import Field from "./Field";

export default class Player {
  hand: Card[] = [];
  havingTurn: boolean = false;
  normalSummonsRemaining = 0;
  name: string;
  field: Field;

  private static logger = LoggerFactory.getLogger("Player");
  private lifePoints: number = 8000;
  private graveyard: Card[] = [];
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
      Player.logger.info(`Drew card ${card.name}`);
      this.hand.push(card);
    } else {
      Player.logger.warn("No cards left to draw");
      global.DUEL.end(global.DUEL.getInactivePlayer());
    }
  }

  startDrawPhase() {
    Player.logger.info(`Starting turn for player ${this.name}`);
    global.DUEL.phase = Phase.Draw;
    this.drawCard();
  }

  startMainPhase1() {
    Player.logger.info(`Starting main phase 1 for player ${this.name}`);
    global.DUEL.phase = Phase.Main1;
    this.normalSummonsRemaining++;
    Player.logger.debug(
      `Player ${this.name} has ${this.normalSummonsRemaining} normal summons remaining`
    );
    let actions = this.getActions();
    while (actions.length > 0) {
      const action = Util.getRandomItemFromArray(actions);
      action.perform();
      actions = this.getActions();
    }
  }

  canNormalSummon() {
    const result: boolean =
      this.havingTurn &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase) &&
      this.normalSummonsRemaining > 0 &&
      this.field.getFreeMonsterZones().length > 0;
    return result;
  }

  startBattlePhase() {
    Player.logger.info(`Starting battle phase for player ${this.name}`);
    global.DUEL.phase = Phase.Battle;
    this.field
      .getMonsters()
      .forEach((monster) => (monster.attacksRemaining = 1));
    this.getActions();
  }

  startEndPhase() {
    Player.logger.info(`Starting end phase for player ${this.name}`);
    global.DUEL.phase = Phase.End;
    this.normalSummonsRemaining = 0;
    while (this.hand.length > 6) {
      this.discardRandom();
    }
  }

  discardRandom() {
    Player.logger.info("Discarding card");
    const card = Util.getRandomItemFromArray(this.hand);
    this.graveyard.push(card);
    Util.removeItemFromArray(this.hand, card);
  }

  private getActions(): Action[] {
    const actions = this.getHandActions().concat(this.getFieldActions());
    Player.logger.debug(`Player ${this.name} has ${actions.length} actions`);
    return actions;
  }

  private getHandActions(): Action[] {
    return this.hand.flatMap((card) => card.getActions());
  }

  private getFieldActions(): Action[] {
    return this.field.getCards().flatMap((card) => card.getActions());
  }
}
