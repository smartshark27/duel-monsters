import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";
import Action from "./Action";
import CardData from "../interfaces/CardData";
import Effects from "./Effects";
import MonsterRebornEffects from "./effects/MonsterRebornEffects";
import { CardFace } from "../enums";
import MirrorForceEffect from "./effects/MirrorForceEffects";
import Zone from "./field/Zone";
import MysticalSpaceTyphoonEffects from "./effects/MysticalSpaceTyphoonEffects";
import CallOfTheHauntedEffects from "./effects/CallOfTheHauntedEffects";
import SupplySquadEffects from "./effects/SupplySquadEffects";
import Activation from "./actions/Activation";

export default class Card {
  activated = false;
  visibility = CardFace.Down;
  controller!: Player;
  turnSet!: number;
  protected effects: Effects | undefined;
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

  set(): void {
    this.visibility = CardFace.Down;
    this.turnSet = global.DUEL.turn;
  }

  inHand(): boolean {
    return this.controller.hand.includes(this);
  }

  onField(): boolean {
    return this.controller.field.getZoneOf(this) instanceof Zone;
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
    this.activated = false;
    this.turnSet = -1;
  }

  toString() {
    return this.getName();
  }

  protected hasEffects(): boolean {
    return this.effects instanceof Effects;
  }

  protected canActivate(): boolean {
    return !this.activated;
  }

  protected getActivationActions(speed: number): Activation[] {
    return (
      (this.canActivate() &&
        this.effects
          ?.getActivationEffects()
          .filter((effect) => effect.speed >= speed && effect.canActivate())
          .map((effect) => new Activation(this.controller, effect))) ||
      []
    );
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
    } else if (this.originalName === "Mystical Space Typhoon") {
      this.effects = new SupplySquadEffects(this);
    }
  }
}
