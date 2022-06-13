import { MoveMethod, Place } from "../../enums";
import LoggerFactory from "../../utils/LoggerFactory";
import Utils from "../../utils/Utils";
import Activation from "../actions/Activation";
import Card from "../Card";
import Effect from "../Effect";
import CardMoveEvent from "../events/CardMoveEvent";
import Zone from "../field/Zone";

export default class ActivationEffect extends Effect {
  protected static logger = LoggerFactory.getLogger("ActivationEffect");

  constructor(card: Card, speed: number) {
    super(card, speed);
  }

  canActivate(): boolean {
    return !global.DUEL.chain.includes(this);
  }

  getActivationActions(): Activation[] {
    return [];
  }

  resolve(): void {}

  protected activateToZone(zone: Zone): void {
    Utils.removeItemFromArray(this.card.controller.hand, this.card);
    zone.card = this.card;
    global.DUEL.chain.addLink(this);
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
