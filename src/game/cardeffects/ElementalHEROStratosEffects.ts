import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import CardMoveEvent from "../events/CardMoveEvent";
import DuelEvent from "../DuelEvent";
import OptionalTriggerEffect from "../effects/OptionalTriggerEffect";
import Monster from "../cards/Monster";
import Utils from "../../utils/Utils";
import CardTarget from "../actions/CardTarget";
import { CardFace, MoveMethod, Place } from "../../enums";

export default class ElementalHEROStratosEffects extends Effects {
  protected static logger = LoggerFactory.getLogger(
    "ElementalHEROStratosEffects"
  );

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new ElementalHEROStratosEffect1(card));
    this.effects.push(new ElementalHEROStratosEffect2(card));
  }
}

class ElementalHEROStratosEffect1 extends OptionalTriggerEffect {
  protected static logger = LoggerFactory.getLogger(
    "ElementalHEROStratosEffect1"
  );
  private destroysRemaining = 0;

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      this.card.visibility === CardFace.Up &&
      !global.DUEL.chain.links.some((effect) => effect.card === this.card) &&
      this.getSpellTraps().length > 0
    );
  }

  override resolve(): void {
    super.resolve();
    this.destroysRemaining = this.getOtherFieldHEROMonsters().length;
    this.targetSpellTrap();
  }

  override toString(): string {
    return `${this.card.name} destroy spell/trap effect`;
  }

  protected override canActivateFromEvents(events: DuelEvent[]): boolean {
    return events.some((event) => {
      return (
        event instanceof CardMoveEvent &&
        event.card === this.card &&
        this.getOtherFieldHEROMonsters().length > 0
      );
    });
  }

  private getOtherFieldHEROMonsters(): Monster[] {
    const monsters = this.card.controller.field
      .getMonsters()
      .filter(
        (card) =>
          card instanceof Monster &&
          card.visibility === CardFace.Up &&
          card.name.includes("HERO")
      );
    Utils.removeItemFromArray(monsters, this.card);
    return monsters;
  }

  private getSpellTraps(): Card[] {
    const controller = this.card.controller;
    return controller.field
      .getSpellTraps()
      .concat(global.DUEL.getOpponentOf(controller).field.getSpellTraps());
  }

  private targetSpellTrap(): void {
    const opponentSpellTraps = this.getSpellTraps();
    if (this.destroysRemaining > 0 && opponentSpellTraps.length > 0) {
      global.DUEL.actionSelection = opponentSpellTraps.map(
        (card) =>
          new CardTarget(this.card.controller, card, (card) =>
            this.destroyTarget(card)
          )
      );
    }
  }

  private destroyTarget(target: Card): void {
    target.destroy();
    new CardMoveEvent(
      this.card.controller,
      target,
      Place.Field,
      Place.Graveyard,
      MoveMethod.DestroyedByEffect,
      this.card,
      this
    );

    this.destroysRemaining--;
    this.targetSpellTrap();
  }
}

class ElementalHEROStratosEffect2 extends OptionalTriggerEffect {
  protected static logger = LoggerFactory.getLogger(
    "ElementalHEROStratosEffect2"
  );

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      this.card.visibility === CardFace.Up &&
      !global.DUEL.chain.links.some((effect) => effect.card === this.card)
    );
  }

  override resolve(): void {
    super.resolve();
    const controller = this.card.controller;
    global.DUEL.actionSelection = this.getDeckHEROMonsters().map(
      (monster) =>
        new CardTarget(controller, monster, (monster) =>
          this.addToHand(monster)
        )
    );
  }

  override toString(): string {
    return `${this.card.name} add HERO to hand effect`;
  }

  protected override canActivateFromEvents(events: DuelEvent[]): boolean {
    return events.some((event) => {
      return (
        event instanceof CardMoveEvent &&
        event.card === this.card &&
        this.getDeckHEROMonsters().length > 0
      );
    });
  }

  private getDeckHEROMonsters(): Monster[] {
    return (
      this.card.controller.deck?.cards
        .filter((card) => card instanceof Monster && card.name.includes("HERO"))
        .map((card) => card as Monster) || []
    );
  }

  private addToHand(card: Card): void {
    const controller = this.card.controller;
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
