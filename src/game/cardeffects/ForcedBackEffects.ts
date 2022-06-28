import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import QuickEffect from "../effects/QuickEffect";
import {
  MoveMethod,
  Place,
} from "../../enums";
import CardMoveEvent from "../events/CardMoveEvent";
import DuelEvent from "../DuelEvent";

export default class ForcedBackEffects extends Effects {
  protected static override logger =
    LoggerFactory.getLogger("ForcedBackEffects");

  constructor(card: Card) {
    super(card);
    this.effects.push(new ForcedBackEffect(card));
  }
}

class ForcedBackEffect extends QuickEffect {
  protected static override logger =
    LoggerFactory.getLogger("ForcedBackEffect");
  private summonEvent: CardMoveEvent | undefined;

  constructor(card: Card) {
    super(card);
    this.speed = 3;
  }

  override canActivate(events: DuelEvent[]): boolean {
    return super.canActivate(events) && this.card.wasSetBeforeThisTurn();
  }

  protected override canActivateFromEvents(events: DuelEvent[]): boolean {
    const summonEvents: CardMoveEvent[] = events.filter(
      (event) =>
        event instanceof CardMoveEvent &&
        [MoveMethod.NormalSummoned, MoveMethod.FlipSummoned].includes(event.how)
    ) as CardMoveEvent[];

    if (summonEvents.length > 0) {
      this.summonEvent = summonEvents[0];
      return true;
    }
    return false;
  }

  override resolve(): void {
    super.resolve();
    if (this.summonEvent) {
      global.DUEL.eventManager.negate(this.summonEvent);
      const summonedMonster = this.summonEvent.card;

      summonedMonster.returnToHand();
      new CardMoveEvent(
        this.card.controller,
        summonedMonster,
        Place.Field,
        Place.Hand,
        MoveMethod.Returned,
        this.card,
        this
      ).publish();
    } else ForcedBackEffect.logger.warn("Summon event was not set");
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
}
