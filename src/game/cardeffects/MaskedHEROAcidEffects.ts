import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import DuelEvent from "../DuelEvent";
import { CardFace, MoveMethod, Place } from "../../enums";
import CardMoveEvent from "../events/CardMoveEvent";
import MandatoryTriggerEffect from "../effects/MandatoryTriggerEffect";

export default class MaskedHEROAcidEffects extends Effects {
  protected static override logger = LoggerFactory.getLogger(
    "MaskedHEROAcidEffects"
  );

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new MaskedHEROAcidEffect(card));
  }
}

class MaskedHEROAcidEffect extends MandatoryTriggerEffect {
  protected static override logger = LoggerFactory.getLogger(
    "MaskedHEROAcidEffect"
  );

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      this.card.visibility === CardFace.Up &&
      this.getOpponentSpellTraps().length > 0
    );
  }

  override resolve(): void {
    super.resolve();
    const controller = this.card.controller;
    const spellTraps = this.getOpponentSpellTraps();
    if (spellTraps.length > 0) {
      spellTraps.forEach((card) => {
        card.destroy();
        new CardMoveEvent(
          controller,
          card,
          Place.Field,
          Place.Graveyard,
          MoveMethod.DestroyedByEffect,
          this.card,
          this
        ).publish();
      });

      global.DUEL.getOpponentOf(controller)
        .field.getMonsters()
        .forEach((monster) => {
          monster.updateAttackPoints(-300);
        });
    }
  }

  override toString(): string {
    return `${this.card.name} effect`;
  }

  protected override canActivateFromEvents(events: DuelEvent[]): boolean {
    return events.some((event) => {
      return (
        event instanceof CardMoveEvent &&
        event.card === this.card &&
        event.how === MoveMethod.SpecialSummoned
      );
    });
  }

  private getOpponentSpellTraps(): Card[] {
    return global.DUEL.getOpponentOf(
      this.card.controller
    ).field.getSpellTraps();
  }
}
