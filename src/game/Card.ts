import LoggerFactory from "../utils/LoggerFactory";
import Player from "./Player";
import Action from "./Action";
import CardData from "../interfaces/CardData";
import Effects from "./Effects";
import MonsterRebornEffects from "./cardeffects/MonsterRebornEffects";
import { CardFace } from "../enums";
import MirrorForceEffect from "./cardeffects/MirrorForceEffects";
import Zone from "./field/Zone";
import MysticalSpaceTyphoonEffects from "./cardeffects/MysticalSpaceTyphoonEffects";
import CallOfTheHauntedEffects from "./cardeffects/CallOfTheHauntedEffects";
import SupplySquadEffects from "./cardeffects/SupplySquadEffects";
import Activation from "./actions/Activation";
import DuelEvent from "./DuelEvent";

export default class Card {
  visibility = CardFace.Down;
  controller!: Player;
  turnSet!: number;
  effects!: Effects;
  private name!: string;

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

  getName(): string {
    return this.name;
  }

  getSpeed1Actions(): Action[] {
    return this.getActivationActions(1);
  }

  getSpeed2Actions(): Action[] {
    return this.getActivationActions(2);
  }

  getActivationActions(speed: number): Action[] {
    return (
      (this.canActivate() && this.effects?.getActivationActions(speed)) || []
    );
  }

  getMandatoryTriggeredActions(events: DuelEvent[]): Activation[] {
    return this.effects
      .getMandatoryTriggeredEffects(events)
      .map((effect) => new Activation(this.controller, effect));
  }

  getOptionalTriggeredActions(events: DuelEvent[]): Activation[] {
    return this.effects
      .getOptionalTriggeredEffects(events)
      .map((effect) => new Activation(this.controller, effect));
  }

  set(): void {
    this.visibility = CardFace.Down;
    this.turnSet = global.DUEL.turn;
  }

  isInHand(): boolean {
    return this.controller.hand.includes(this);
  }

  isOnField(): boolean {
    return this.controller.field.getZoneOf(this) instanceof Zone;
  }

  isSet(): boolean {
    return this.turnSet > 0 && this.visibility === CardFace.Down;
  }

  wasSetBeforeThisTurn(): boolean {
    return this.isSet() && this.turnSet < global.DUEL.turn;
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
    this.turnSet = -1;
  }

  toString() {
    return this.getName();
  }

  protected canActivate(): boolean {
    return true;
  }

  private setEffects(): void {
    if (this.originalName === "Call of the Haunted") {
      this.effects = new CallOfTheHauntedEffects(this);
    } else if (this.originalName === "Mirror Force") {
      this.effects = new MirrorForceEffect(this);
    } else if (this.originalName === "Monster Reborn") {
      this.effects = new MonsterRebornEffects(this);
    } else if (this.originalName === "Mystical Space Typhoon") {
      this.effects = new MysticalSpaceTyphoonEffects(this);
    } else if (this.originalName === "Supply Squad") {
      this.effects = new SupplySquadEffects(this);
    } else {
      this.effects = new Effects(this);
    }
  }
}
