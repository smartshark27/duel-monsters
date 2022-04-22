import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";
import Action from "./Action";
import CardData from "../interfaces/CardData";
import Effect from "./Effect";
import MonsterRebornEffect from "./effects/MonsterRebornEffect";

export default class Card {
  controller!: Player;
  protected effect: Effect | undefined;
  private name!: string;

  protected static logger = LoggerFactory.getLogger("Card");

  constructor(
    public owner: Player,
    protected originalName: string,
    protected data: CardData
  ) {
    Card.logger.debug(`Creating card ${originalName}`);
    this.setEffect();
    this.reset();
  }

  getName(): string {
    return this.name;
  }

  getActions(): Action[] {
    Card.logger.warn("getActions() not implemented for subclass of Card");
    return [];
  }

  activate(): void {
    if (this.effect) this.effect.activate();
  }

  resolve(): void {
    if (this.effect) this.effect.resolve();
  }

  destroy(): void {
    this.sendToGraveyard();
  }

  sendToGraveyard(): void {
    const zone =
      this.controller.field.getZoneOf(this) ||
      global.DUEL.getOpponentOf(this.controller).field.getZoneOf(this);
    if (zone) {
      this.owner.graveyard.push(this);
      zone.card = null;
      this.reset();
    }
  }

  reset(): void {
    this.name = this.originalName;
    this.controller = this.owner;
  }

  toString() {
    return this.getName();
  }

  private setEffect(): void {
    if (this.originalName === "Monster Reborn") {
      this.effect = new MonsterRebornEffect(this);
    }
  }
}
