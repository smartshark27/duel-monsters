import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import CardMoveEvent from "../events/CardMoveEvent";
import DuelEvent from "../DuelEvent";
import OptionalTriggerEffect from "../effects/OptionalTriggerEffect";
import Monster from "../cards/Monster";
import Utils from "../../utils/Utils";
import CardSelect from "../actions/CardSelect";
import { MoveMethod, Place, SpellType } from "../../enums";
import Spell from "../cards/Spell";

export default class ElementalHEROShadowMistEffects extends Effects {
  protected static override logger = LoggerFactory.getLogger(
    "ElementalHEROShadowMistEffects"
  );

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new ElementalHEROShadowMistEffect1(card));
    this.effects.push(new ElementalHEROShadowMistEffect2(card));
  }
}

class ElementalHEROShadowMistEffect1 extends OptionalTriggerEffect {
  protected static override logger = LoggerFactory.getLogger(
    "ElementalHEROShadowMistEffect1"
  );

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      this.getChangeSpellsFromDeck().length > 0 &&
      !global.DUEL.eventManager.wasCardNameActivatedThisTurn(this.card.name)
    );
  }

  override resolve(): void {
    super.resolve();
    const controller = this.card.controller;
    global.DUEL.actionSelection = this.getChangeSpellsFromDeck().map(
      (card) => new CardSelect(controller, card, (card) => this.addToHand(card))
    );
  }

  override toString(): string {
    return `${this.card.name} add change spell to hand effect`;
  }

  protected override canActivateFromEvents(events: DuelEvent[]): boolean {
    return events.some(
      (event) =>
        event instanceof CardMoveEvent &&
        event.card === this.card &&
        event.how === MoveMethod.SpecialSummoned
    );
  }

  private getChangeSpellsFromDeck(): Spell[] {
    return (
      this.card.controller.deck?.cards
        .filter(
          (card) =>
            card instanceof Spell &&
            card.type === SpellType.QuickPlay &&
            card.name.includes("Change")
        )
        .map((card) => card as Spell) || []
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

class ElementalHEROShadowMistEffect2 extends OptionalTriggerEffect {
  protected static override logger = LoggerFactory.getLogger(
    "ElementalHEROShadowMistEffect2"
  );

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      this.getDeckHEROMonsters().length > 0 &&
      !global.DUEL.eventManager.wasCardNameActivatedThisTurn(this.card.name)
    );
  }

  override resolve(): void {
    super.resolve();
    const controller = this.card.controller;
    global.DUEL.actionSelection = this.getDeckHEROMonsters().map(
      (monster) =>
        new CardSelect(controller, monster, (monster) =>
          this.addToHand(monster)
        )
    );
  }

  override toString(): string {
    return `${this.card.name} add HERO to hand effect`;
  }

  protected override canActivateFromEvents(events: DuelEvent[]): boolean {
    return events.some(
      (event) =>
        event instanceof CardMoveEvent &&
        event.card === this.card &&
        event.to === Place.Graveyard
    );
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
