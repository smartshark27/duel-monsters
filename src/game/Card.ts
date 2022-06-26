import LoggerFactory from "../utils/LoggerFactory";
import Player from "./Player";
import Action from "./Action";
import CardData from "../interfaces/CardData";
import Effects from "./Effects";
import { CardFace, Phase } from "../enums";
import Zone from "./field/Zone";
import Activation from "./actions/Activation";
import DuelEvent from "./DuelEvent";

export default class Card {
  visibility = CardFace.Down;
  controller!: Player;
  effects!: Effects;
  name!: string;
  turnPositionUpdated = 0;
  turnSet = 0;

  protected static logger = LoggerFactory.getLogger("Card");

  constructor(
    public owner: Player,
    protected originalName: string,
    public data: CardData
  ) {
    Card.logger.debug(`Creating card ${originalName}`);
    this.setEffects();
    this.reset();
  }

  getActions(speed: number, events: DuelEvent[]): Action[] {
    const actions = [];
    if (speed <= 1) actions.push(...this.getSpeed1Actions());
    return actions.concat(this.getActivationActions(speed, events));
  }

  getActivationActions(speed: number, events: DuelEvent[]): Action[] {
    return (
      (this.canActivate() &&
        this.effects?.getActivationActions(speed, events)) ||
      []
    );
  }

  getMandatoryTriggeredActions(events: DuelEvent[]): Activation[] {
    return this.effects.getMandatoryTriggeredActions(events);
  }

  getOptionalTriggeredActions(events: DuelEvent[]): Activation[] {
    return this.effects.getOptionalTriggeredActions(events);
  }

  isInHand(): boolean {
    return this.controller.hand.includes(this);
  }

  isOnField(): boolean {
    return this.controller.field.getZoneOf(this) instanceof Zone;
  }

  isSet(): boolean {
    return (
      this.turnSet > 0 && this.visibility === CardFace.Down && this.isOnField()
    );
  }

  wasSetBeforeThisTurn(): boolean {
    return this.isSet() && this.turnSet < global.DUEL.turn;
  }

  set(): void {
    this.visibility = CardFace.Down;
    const currentTurn = global.DUEL.turn;
    this.turnPositionUpdated = currentTurn;
    this.turnSet = currentTurn;
  }

  destroy(): void {
    this.sendToGraveyard();
    Card.logger.info(`${this} has been destroyed`);
  }

  sendToGraveyard(): void {
    const zone =
      this.controller.field.getZoneOf(this) ||
      global.DUEL.getOpponentOf(this.controller).field.getZoneOf(this);
    if (zone) {
      this.visibility = CardFace.Up;
      this.owner.graveyard.push(this);
      zone.card = null;
      this.reset();
    }
  }

  reset(): void {
    this.name = this.originalName;
    this.controller = this.owner;
    this.turnPositionUpdated = 0;
    this.turnSet = 0;
    this.effects.reset();
  }

  toString() {
    return this.name;
  }

  protected getSpeed1Actions(): Action[] {
    return [];
  }

  protected canActivate(): boolean {
    return true;
  }

  protected canSet(): boolean {
    return (
      this.controller.isTurnPlayer() &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase) &&
      this.isInHand()
    );
  }

  protected setEffects(): void {
    this.effects = new Effects(this);
  }
}
