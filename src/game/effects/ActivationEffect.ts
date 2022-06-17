import { CardFace, MoveMethod, Place } from "../../enums";
import LoggerFactory from "../../utils/LoggerFactory";
import Utils from "../../utils/Utils";
import Activation from "../actions/Activation";
import Card from "../Card";
import DuelEvent from "../DuelEvent";
import Effect from "../Effect";
import CardMoveEvent from "../events/CardMoveEvent";
import Zone from "../field/Zone";

export default class ActivationEffect extends Effect {
  protected static logger = LoggerFactory.getLogger("ActivationEffect");

  constructor(card: Card, speed: number) {
    super(card, speed);
  }

  canActivate(events: DuelEvent[]): boolean {
    return !global.DUEL.chain.includes(this) && this.canActivateFromEvents(events);
  }

  override activate(): void {
    this.card.visibility = CardFace.Up;
    global.DUEL.chain.addLink(this);
  }

  getActivationActions(): Activation[] {
    return [new Activation(this.card.controller, this)];
  }

  resolve(): void {}

  protected canActivateFromEvents(events: DuelEvent[]): boolean {
    return true;
  }

  protected activateToZone(zone: Zone): void {
    Utils.removeItemFromArray(this.card.controller.hand, this.card);
    zone.card = this.card;
    new CardMoveEvent(
      this.card.controller,
      this.card,
      Place.Hand,
      Place.Field,
      MoveMethod.Activated,
      this.card,
      this
    ).publish();
  }
}
