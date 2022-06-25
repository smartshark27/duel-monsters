import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import IgnitionEffect from "../effects/IgnitionEffect";
import ZoneSelect from "../actions/ZoneSelect";
import CardMoveEvent from "../events/CardMoveEvent";
import { MoveMethod, Place } from "../../enums";
import DuelEvent from "../DuelEvent";

export default class HarpiesFeatherDusterEffects extends Effects {
  constructor(protected card: Card) {
    super(card);
    this.effects.push(new HarpiesFeatherDusterEffect(card));
  }
}

class HarpiesFeatherDusterEffect extends IgnitionEffect {
  protected static logger = LoggerFactory.getLogger(
    "HarpiesFeatherDusterEffect"
  );

  override canActivate(events: DuelEvent[]): boolean {
    const controller = this.card.controller;
    return (
      super.canActivate(events) &&
      (this.card.wasSetBeforeThisTurn() ||
        (this.card.isInHand() && controller.canPlaySpellTrap())) &&
      this.getOpponentSpellTraps().length > 0
    );
  }

  override activate(): void {
    const controller = this.card.controller;

    if (!this.card.wasSetBeforeThisTurn()) {
      super.activate();
      global.DUEL.actionSelection = controller.field
        .getFreeSpellTrapZones()
        .map(
          (zone) =>
            new ZoneSelect(controller, zone, (zone) =>
              this.activateToZone(zone)
            )
        );
    } else super.activate();
  }

  override resolve(): void {
    super.resolve();
    this.getOpponentSpellTraps().forEach((card) => {
      card.destroy();
      new CardMoveEvent(
        this.card.controller,
        card,
        Place.Field,
        Place.Graveyard,
        MoveMethod.DestroyedByEffect,
        this.card,
        this
      );
    });
  }

  override cleanup(): void {
    super.cleanup();
    this.card.sendToGraveyard();
    new CardMoveEvent(
      this.card.controller,
      this.card,
      Place.Field,
      Place.Graveyard,
      MoveMethod.Sent
    ).publish();
  }

  private getOpponentSpellTraps(): Card[] {
    return global.DUEL.getOpponentOf(
      this.card.controller
    ).field.getSpellTraps();
  }
}
