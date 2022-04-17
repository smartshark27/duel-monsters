import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";
import Action from "./actions/Action";
import CardData from "../interfaces/CardData";

export default class Card {
  name: string;

  protected static logger = LoggerFactory.getLogger("Card");

  constructor(protected owner: Player, name: string, protected data: CardData) {
    Card.logger.debug(`Creating card ${name}`);
    this.name = name;
  }

  getActions(): Action[] {
    Card.logger.warn("Should not happen");
    return [];
  }

  destroy(): void {
    this.sendToGraveyard();
  }

  private sendToGraveyard(): void {
    const zone = this.owner.field.getZoneOf(this);
    if (zone) {
      this.owner.graveyard.push(this);
      zone.card = null;
    }
  }
}
