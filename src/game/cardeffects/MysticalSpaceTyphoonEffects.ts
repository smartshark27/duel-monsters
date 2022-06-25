import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import CardSelect from "../actions/CardSelect";
import QuickEffect from "../effects/QuickEffect";
import DuelEvent from "../DuelEvent";
import ZoneSelect from "../actions/ZoneSelect";
import Zone from "../field/Zone";
import CardMoveEvent from "../events/CardMoveEvent";
import { MoveMethod, Place } from "../../enums";
import Utils from "../../utils/Utils";

export default class MysticalSpaceTyphoonEffects extends Effects {
  protected static logger = LoggerFactory.getLogger(
    "MysticalSpaceTyphoonEffects"
  );

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new MysticalSpaceTyphoonEffect1(card));
  }
}

class MysticalSpaceTyphoonEffect1 extends QuickEffect {
  protected static logger = LoggerFactory.getLogger(
    "DestroySpellTrapQuickEffect"
  );
  private target: Card | null = null;

  constructor(card: Card) {
    super(card);
  }

  override canActivate(events: DuelEvent[]): boolean {
    const controller = this.card.controller;
    return (
      super.canActivate(events) &&
      (this.card.wasSetBeforeThisTurn() ||
        (controller.isTurnPlayer() &&
          this.card.isInHand() &&
          controller.canPlaySpellTrap())) &&
      this.getSpellTraps().length > 0
    );
  }

  override activate(): void {
    const controller = this.card.controller;

    if (this.card.wasSetBeforeThisTurn()) {
      super.activate();
      global.DUEL.actionSelection = this.getSpellTraps().map(
        (card) =>
          new CardSelect(controller, card, (card) => this.setTarget(card))
      );
    } else {
      super.activate();
      global.DUEL.actionSelection = controller.field
        .getFreeSpellTrapZones()
        .map(
          (zone) =>
            new ZoneSelect(controller, zone, (zone) =>
              this.activateToZone(zone)
            )
        );
    }
  }

  override resolve(): void {
    super.resolve();
    if (this.target) {
      this.target.destroy();
      new CardMoveEvent(
        this.card.controller,
        this.target,
        Place.Field,
        Place.Graveyard,
        MoveMethod.DestroyedByEffect,
        this.card,
        this
      ).publish();
    } else MysticalSpaceTyphoonEffect1.logger.warn(`Target is not set`);
    this.target = null;
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

  protected override activateToZone(zone: Zone): void {
    super.activateToZone(zone);
    global.DUEL.actionSelection = this.getSpellTraps().map(
      (card) =>
        new CardSelect(this.card.controller, card, (card) =>
          this.setTarget(card)
        )
    );
  }

  private getSpellTraps(): Card[] {
    const opponent = global.DUEL.getOpponentOf(this.card.controller);
    const spellTraps = this.card.controller.field
      .getSpellTraps()
      .concat(opponent.field.getSpellTraps());
    Utils.removeItemFromArray(spellTraps, this.card);
    return spellTraps;
  }

  private setTarget(card: Card): void {
    this.target = card;
  }
}
