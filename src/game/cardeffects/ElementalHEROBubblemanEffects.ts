import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import SpecialSummonEffect from "../effects/SpecialSummonEffect";
import OptionalTriggerEffect from "../effects/OptionalTriggerEffect";
import DuelEvent from "../DuelEvent";
import { CardFace, MoveMethod, Place } from "../../enums";
import CardMoveEvent from "../events/CardMoveEvent";

export default class ElementalHEROBubblemanEffects extends Effects {
  protected static logger = LoggerFactory.getLogger(
    "ElementalHEROBubblemanEffects"
  );

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new ElementalHEROBubblemanEffect1(card));
    this.effects.push(new ElementalHEROBubblemanEffect2(card));
  }
}

class ElementalHEROBubblemanEffect1 extends SpecialSummonEffect {
  protected static logger = LoggerFactory.getLogger(
    "ElementalHEROBubblemanEffect1"
  );

  override canActivate(): boolean {
    return (
      super.canActivate() &&
      this.card.isInHand() &&
      this.card.controller.hand.length === 1
    );
  }

  override toString(): string {
    return `${this.card.name} special summon effect`;
  }
}

class ElementalHEROBubblemanEffect2 extends OptionalTriggerEffect {
  protected static logger = LoggerFactory.getLogger(
    "ElementalHEROBubblemanEffect2"
  );

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      this.card.visibility === CardFace.Up &&
      this.controllerHasNoCards()
    );
  }

  override resolve(): void {
    super.resolve();
    this.drawCard();
    this.drawCard();
  }

  override toString(): string {
    return `${this.card.name} draw cards effect`;
  }

  protected override canActivateFromEvents(events: DuelEvent[]): boolean {
    return events.some((event) => {
      return (
        event instanceof CardMoveEvent &&
        event.card === this.card &&
        [MoveMethod.NormalSummoned, MoveMethod.SpecialSummoned].includes(
          event.how
        )
      );
    });
  }

  private controllerHasNoCards(): boolean {
    const controller = this.card.controller;
    return (
      controller.hand.length === 0 && controller.field.getCards().length === 1
    );
  }

  private drawCard(): void {
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
}
