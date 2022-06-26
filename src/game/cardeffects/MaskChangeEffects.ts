import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import CardSelect from "../actions/CardSelect";
import QuickEffect from "../effects/QuickEffect";
import DuelEvent from "../DuelEvent";
import ZoneSelect from "../actions/ZoneSelect";
import Zone from "../field/Zone";
import CardMoveEvent from "../events/CardMoveEvent";
import { BattlePosition, MoveMethod, Place } from "../../enums";
import Monster from "../cards/Monster";
import Utils from "../../utils/Utils";
import BattlePositionSelect from "../actions/BattlePositionSelect";

export default class MaskChangeEffects extends Effects {
  protected static override logger =
    LoggerFactory.getLogger("MaskChangeEffects");

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new MaskChangeEffect(card));
  }
}

class MaskChangeEffect extends QuickEffect {
  protected static override logger =
    LoggerFactory.getLogger("MaskChangeEffect");
  private target: Monster | null = null;
  private maskedHERO: Monster | null = null;

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
      this.getFieldHEROMonsters().length > 0
    );
  }

  override activate(): void {
    const controller = this.card.controller;

    if (this.card.wasSetBeforeThisTurn()) {
      super.activate();
      global.DUEL.actionSelection = this.getFieldHEROMonsters().map(
        (monster) =>
          new CardSelect(controller, monster, (monster) =>
            this.setTarget(monster as Monster)
          )
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
    if (this.target?.isOnField()) {
      this.target.sendToGraveyard();
      new CardMoveEvent(
        this.card.controller,
        this.target,
        Place.Field,
        Place.Graveyard,
        MoveMethod.Sent,
        this.card,
        this
      ).publish();

      global.DUEL.actionSelection = this.getMaskedHEROMonsters()
        .filter((monster) =>
          this.target?.attributes.includes(monster.originalAttribute)
        )
        .map(
          (monster) =>
            new CardSelect(this.card.controller, monster, (monster) =>
              this.selectMaskedHERO(monster as Monster)
            )
        );
    } else MaskChangeEffect.logger.warn(`Target is not set`);
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
    global.DUEL.actionSelection = this.getFieldHEROMonsters().map(
      (monster) =>
        new CardSelect(this.card.controller, monster, (monster) =>
          this.setTarget(monster as Monster)
        )
    );
  }

  private getFieldHEROMonsters(): Monster[] {
    const extraDeckAttributes = this.getMaskedHEROMonsters().map(
      (monster) => monster.originalAttribute
    );
    MaskChangeEffect.logger.warn(`attrs are ${extraDeckAttributes}`);
    return this.card.controller.field
      .getMonsters()
      .filter(
        (monster) =>
          monster.name.includes("HERO") &&
          monster.attributes.some((attr) => extraDeckAttributes.includes(attr))
      );
  }

  private getMaskedHEROMonsters(): Monster[] {
    return this.card.controller.extraDeck.filter((monster) =>
      monster.name.includes("Masked HERO")
    );
  }

  private setTarget(monster: Monster): void {
    this.target = monster;
  }

  private selectMaskedHERO(monster: Monster): void {
    this.maskedHERO = monster;

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

  private specialSummonMonsterToZone(zone: Zone): void {
    if (this.maskedHERO) {
      const controller = this.card.controller;
      Utils.removeItemFromArray(controller.extraDeck, this.maskedHERO);
      zone.card = this.maskedHERO;

      new CardMoveEvent(
        controller,
        this.maskedHERO,
        Place.ExtraDeck,
        Place.Field,
        MoveMethod.SpecialSummoned,
        this.card,
        this
      ).publish();

      global.DUEL.actionSelection = [
        BattlePosition.Attack,
        BattlePosition.Defence,
      ].map(
        (position) =>
          new BattlePositionSelect(controller, position, (position) =>
            this.chooseBattlePosition(position)
          )
      );
    } else MaskChangeEffect.logger.warn("Masked HERO is not set");
  }

  private chooseBattlePosition(position: BattlePosition): void {
    if (this.maskedHERO) this.maskedHERO.setPosition(position);
    this.maskedHERO = null;
  }
}
