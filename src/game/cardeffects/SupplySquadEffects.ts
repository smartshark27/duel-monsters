import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import IgnitionEffect from "../effects/IgnitionEffect";
import ZoneSelect from "../actions/ZoneSelect";
import CardMoveEvent from "../events/CardMoveEvent";
import { CardFace, MoveMethod, Place } from "../../enums";
import OptionalTriggerEffect from "../effects/OptionalTriggerEffect";
import DuelEvent from "../DuelEvent";
import Monster from "../cards/Monster";

export default class SupplySquadEffects extends Effects {
  protected static logger = LoggerFactory.getLogger("SupplySquadEffects");

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new SupplySquadTriggerEffect(card));
    this.effects.push(new SupplySquadPlayEffect(card));
  }
}

class SupplySquadPlayEffect extends IgnitionEffect {
  protected static logger = LoggerFactory.getLogger("SupplySquadPlayEffect");

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      (this.card.wasSetBeforeThisTurn() ||
        (this.card.isInHand() && this.card.controller.canPlaySpellTrap()))
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
}

class SupplySquadTriggerEffect extends OptionalTriggerEffect {
  protected static logger = LoggerFactory.getLogger("SupplySquadTriggerEffect");
  private turnLastActivated = 0;

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      this.card.isOnField() &&
      this.card.visibility === CardFace.Up &&
      this.turnLastActivated < global.DUEL.turn
    );
  }

  override activate(): void {
    super.activate();
    this.turnLastActivated = global.DUEL.turn;
  }

  override resolve(): void {
    super.resolve();

    const controller = this.card.controller;
    const drawnCard = controller.drawCard();
    if (drawnCard)
      new CardMoveEvent(
        controller,
        drawnCard,
        Place.Deck,
        Place.Hand,
        MoveMethod.Drawn,
        this.card,
        this
      ).publish();
  }

  protected override canActivateFromEvents(events: DuelEvent[]): boolean {
    return events.some((event) => {
      return (
        event instanceof CardMoveEvent &&
        event.card instanceof Monster &&
        event.card.controller === this.card.controller &&
        [MoveMethod.DestroyedByBattle, MoveMethod.DestroyedByEffect].includes(
          event.how
        )
      );
    });
  }
}
