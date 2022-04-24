import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";
import Action from "./Action";
import CardData from "../interfaces/CardData";
import Effect from "./Effect";
import MonsterRebornEffect from "./effects/MonsterRebornEffect";
import { CardFace } from "../enums";
import MirrorForceEffect from "./effects/MirrorForceEffect";
import Zone from "./field/Zone";
import MysticalSpaceTyphoonEffect from "./effects/MysticalSpaceTyphoonEffect";

export default class Card {
  activated = false;
  visibility = CardFace.Down;
  controller!: Player;
  turnSet!: number;
  protected effect: Effect | undefined;
  private name!: string;

  protected static logger = LoggerFactory.getLogger("Card");

  constructor(
    public owner: Player,
    protected originalName: string,
    public data: CardData
  ) {
    Card.logger.debug(`Creating card ${originalName}`);
    this.setEffect();
    this.reset();
  }

  getName(): string {
    return this.name;
  }

  getSpeed1Actions(): Action[] {
    return this.getSpeed2Actions();
  }

  getSpeed2Actions(): Action[] {
    return [];
  }

  activate(): void {
    this.visibility = CardFace.Up;
    this.activated = true;
    if (this.effect) this.effect.activate();
  }

  set(): void {
    this.visibility = CardFace.Down;
    this.turnSet = global.DUEL.turnCounter;
  }

  resolve(): void {
    if (this.effect) this.effect.resolve();
    this.activated = false;
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

  protected canActivate(): boolean {
    return !this.hasActivated() && (this.effect?.canActivate() as boolean);
  }

  private setEffect(): void {
    if (this.originalName === "Mirror Force") {
      this.effect = new MirrorForceEffect(this);
    } else if (this.originalName === "Monster Reborn") {
      this.effect = new MonsterRebornEffect(this);
    } else if (this.originalName === "Mystical Space Typhoon") {
      this.effect = new MysticalSpaceTyphoonEffect(this);
    }
  }

  private hasActivated(): boolean {
    return this.activated;
  }
}
