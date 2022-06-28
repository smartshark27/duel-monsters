import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import CardMoveEvent from "../events/CardMoveEvent";
import DuelEvent from "../DuelEvent";
import Monster from "../cards/Monster";
import CardSelect from "../actions/CardSelect";
import { MoveMethod, Place } from "../../enums";
import IgnitionEffect from "../effects/IgnitionEffect";
import Utils from "../../utils/Utils";
import ZoneSelect from "../actions/ZoneSelect";

export default class EEmergencyCallEffects extends Effects {
  protected static override logger = LoggerFactory.getLogger(
    "EEmergencyCallEffects"
  );

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new EEmergencyCallEffect(card));
  }
}

class EEmergencyCallEffect extends IgnitionEffect {
  protected static override logger = LoggerFactory.getLogger("EEmergencyCallEffect");

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      (this.card.wasSetBeforeThisTurn() ||
        (this.card.isInHand() && this.card.controller.canPlaySpellTrap())) &&
      this.getDeckElementalHEROMonsters().length > 0
    );
  }

  override activate(): void {
    const controller = this.card.controller;

    super.activate();

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
    }
  }

  override resolve(): void {
    super.resolve();
    const controller = this.card.controller;

    global.DUEL.actionSelection = this.getDeckElementalHEROMonsters().map(
      (monster) =>
        new CardSelect(controller, monster, (monster) =>
          this.addToHand(monster)
        )
    );
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

  private getDeckElementalHEROMonsters(): Monster[] {
    return (
      this.card.controller.deck?.cards
        .filter(
          (card) =>
            card instanceof Monster && card.name.includes("Elemental HERO")
        )
        .map((card) => card as Monster) || []
    );
  }

  private addToHand(card: Card): void {
    const controller = this.card.controller;
    if (controller.deck) Utils.removeItemFromArray(controller.deck.cards, card);
    controller.hand.push(card);
    new CardMoveEvent(
      controller,
      card,
      Place.Deck,
      Place.Hand,
      MoveMethod.Added,
      this.card,
      this
    ).publish();
  }
}
