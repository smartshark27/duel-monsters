import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";
import Action from "./Action";
import CardData from "../interfaces/CardData";
import Effect from "./Effect";
import MonsterRebornEffect from "./effects/MonsterRebornEffect";

export default class Card {
  name: string;
  controller!: Player;
  protected effect: Effect | undefined;

  protected static logger = LoggerFactory.getLogger("Card");

  constructor(public owner: Player, name: string, protected data: CardData) {
    Card.logger.debug(`Creating card ${name}`);
    this.name = name;
    this.setEffect();
    this.reset();
  }

  getActions(): Action[] {
    Card.logger.warn("getActions() not implemented for subclass of Card");
    return [];
  }

  activate(): void {
    if (this.effect) {
      this.effect.activate();
    }
  }

  destroy(): void {
    this.sendToGraveyard();
  }

  sendToGraveyard(): void {
    const zone = this.controller.field.getZoneOf(this);
    if (zone) {
      this.owner.graveyard.push(this);
      zone.card = null;
      this.reset();
    }
  }

  reset(): void {
    this.controller = this.owner;
  }

  toString() {
    return this.name;
  }

  private setEffect(): void {
    if (this.name === "Monster Reborn") {
      this.effect = new MonsterRebornEffect(this);
    }
  }
}
