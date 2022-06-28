import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Monster from "../cards/Monster";
import Effects from "../Effects";
import QuickEffect from "../effects/QuickEffect";
import CardSelect from "../actions/CardSelect";
import { BattlePhaseStep, CardFace, MoveMethod, Place } from "../../enums";
import ZoneSelect from "../actions/ZoneSelect";
import Zone from "../field/Zone";
import Utils from "../../utils/Utils";
import CardMoveEvent from "../events/CardMoveEvent";
import MandatoryTriggerEffect from "../effects/MandatoryTriggerEffect";
import DuelEvent from "../DuelEvent";

export default class CallOfTheHauntedEffects extends Effects {
  protected static override logger = LoggerFactory.getLogger("CallOfTheHauntedEffects");
  public effect2: CallOfTheHauntedEffect2;

  constructor(card: Card) {
    super(card);
    this.effects.push(new CallOfTheHauntedEffect1(card));
    this.effect2 = new CallOfTheHauntedEffect2(card);
    this.effects.push(this.effect2);
  }
}

class CallOfTheHauntedEffect1 extends QuickEffect {
  protected static override logger = LoggerFactory.getLogger("CallOfTheHauntedEffect1");
  private monster: Monster | null = null;

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      this.card.wasSetBeforeThisTurn() &&
      this.canActivateDuringTiming() &&
      this.getGraveyardMonsters().length > 0 &&
      this.card.controller.field.getFreeMonsterZones().length > 0
    );
  }

  override activate(): void {
    super.activate();
    const controller = this.card.controller;
    global.DUEL.actionSelection = this.getGraveyardMonsters().map(
      (monster) =>
        new CardSelect(controller, monster, (monster) =>
          this.targetGraveyardMonster(monster as Monster)
        )
    );
  }

  override resolve(): void {
    super.resolve();
    const controller = this.card.controller;

    global.DUEL.actionSelection = controller.field
      .getFreeMonsterZones()
      .map(
        (zone) =>
          new ZoneSelect(controller, zone, (zone) =>
            this.specialSummonMonsterToZone(zone)
          )
      );
  }

  private canActivateDuringTiming(): boolean {
    return (
      global.DUEL.chain.getLength() > 0 ||
      global.DUEL.battlePhaseStep !== BattlePhaseStep.Damage
    );
  }

  private getGraveyardMonsters(): Monster[] {
    return this.card.controller.graveyard.filter(
      (card) => card instanceof Monster
    ) as Monster[];
  }

  private targetGraveyardMonster(monster: Monster): void {
    this.monster = monster;
  }

  private specialSummonMonsterToZone(zone: Zone): void {
    if (this.monster) {
      Utils.removeItemFromArray(
        this.monster.controller.graveyard,
        this.monster
      );
      zone.card = this.monster;
      this.monster.visibility = CardFace.Up;
      this.monster.turnPositionUpdated = global.DUEL.turn;

      new CardMoveEvent(
        this.card.controller,
        this.monster,
        Place.Graveyard,
        Place.Field,
        MoveMethod.SpecialSummoned,
        this.card,
        this
      ).publish();

      (this.card.effects as CallOfTheHauntedEffects).effect2.monster =
        this.monster;
    } else CallOfTheHauntedEffect1.logger.warn("Target is not set");
  }
}

class CallOfTheHauntedEffect2 extends MandatoryTriggerEffect {
  protected static override logger = LoggerFactory.getLogger("CallOfTheHauntedEffect2");
  monster: Monster | null = null;

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      this.monster !== null &&
      this.card.isOnField() &&
      this.card.visibility === CardFace.Up
    );
  }

  override resolve(): void {
    super.resolve();
    const controller = this.card.controller;
    this.card.destroy();

    new CardMoveEvent(
      controller,
      this.card,
      Place.Field,
      Place.Graveyard,
      MoveMethod.DestroyedByEffect,
      this.card,
      this
    ).publish();
  }

  protected override canActivateFromEvents(events: DuelEvent[]): boolean {
    return events.some((event) => {
      return (
        event instanceof CardMoveEvent &&
        event.card instanceof Monster &&
        event.card === this.monster &&
        [MoveMethod.DestroyedByBattle, MoveMethod.DestroyedByEffect].includes(
          event.how
        )
      );
    });
  }
}
