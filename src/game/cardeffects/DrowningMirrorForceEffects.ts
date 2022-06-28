import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import QuickEffect from "../effects/QuickEffect";
import { BattlePosition, MoveMethod, Place, TargetMethod } from "../../enums";
import CardMoveEvent from "../events/CardMoveEvent";
import DuelEvent from "../DuelEvent";
import PlayerTargetEvent from "../events/PlayerTargetEvent";

export default class DrowningMirrorForceEffects extends Effects {
  protected static override logger = LoggerFactory.getLogger(
    "DrowningMirrorForceEffects"
  );

  constructor(card: Card) {
    super(card);
    this.effects.push(new DrowningMirrorForceEffect(card));
  }
}

class DrowningMirrorForceEffect extends QuickEffect {
  protected static override logger = LoggerFactory.getLogger(
    "DrowningMirrorForceEffect"
  );

  constructor(card: Card) {
    super(card);
  }

  override canActivate(events: DuelEvent[]): boolean {
    return super.canActivate(events) && this.card.wasSetBeforeThisTurn();
  }

  override resolve(): void {
    super.resolve();

    const controller = this.card.controller;

    global.DUEL.getOpponentOf(controller)
      .field.getMonsters()
      .filter((monster) => monster.position === BattlePosition.Attack)
      .forEach((monster) => {
        monster.shuffleIntoDeck();
        new CardMoveEvent(
          controller,
          monster,
          Place.Field,
          Place.Deck,
          MoveMethod.Returned,
          this.card,
          this
        ).publish();
      });

    global.DUEL.attack = null;
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

  protected override canActivateFromEvents(events: DuelEvent[]): boolean {
    return events.some(
      (event) =>
        event instanceof PlayerTargetEvent &&
        event.target === this.card.controller &&
        event.how === TargetMethod.Attack
    );
  }
}
