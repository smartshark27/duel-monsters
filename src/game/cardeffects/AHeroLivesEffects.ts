import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Monster from "../cards/Monster";
import CardSelect from "../actions/CardSelect";
import IgnitionEffect from "../effects/IgnitionEffect";
import ZoneSelect from "../actions/ZoneSelect";
import Zone from "../field/Zone";
import Utils from "../../utils/Utils";
import CardMoveEvent from "../events/CardMoveEvent";
import { BattlePosition, MoveMethod, Place } from "../../enums";
import BattlePositionSelect from "../actions/BattlePositionSelect";
import DuelEvent from "../DuelEvent";

export default class AHeroLivesEffects extends Effects {
  protected static override logger = LoggerFactory.getLogger("AHeroLivesEffects");

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new AHeroLivesEffect1(card));
  }
}

class AHeroLivesEffect1 extends IgnitionEffect {
  protected static override logger = LoggerFactory.getLogger("AHeroLivesEffect1");
  private target: Monster | null = null;

  override canActivate(events: DuelEvent[]): boolean {
    const controller = this.card.controller;
    return (
      super.canActivate(events) &&
      (this.card.wasSetBeforeThisTurn() ||
        (this.card.isInHand() && controller.canPlaySpellTrap())) &&
      controller.field.getMonsters().length === 0 &&
      this.getDeckHEROMonsters().length > 0
    );
  }

  override activate(): void {
    const controller = this.card.controller;

    if (this.card.wasSetBeforeThisTurn()) {
      super.activate();
      this.halveLifePoints();
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

  protected override activateToZone(zone: Zone): void {
    super.activateToZone(zone);
    this.halveLifePoints();
  }

  override resolve(): void {
    super.resolve();

    global.DUEL.actionSelection = this.getDeckHEROMonsters().map(
      (monster) =>
        new CardSelect(this.card.controller, monster, (monster) =>
          this.selectMonster(monster as Monster)
        )
    );
  }

  private getDeckHEROMonsters(): Monster[] {
    return (
      this.card.controller.deck?.cards
        .filter(
          (card) =>
            card instanceof Monster &&
            card.level <= 4 &&
            card.name.includes("Elemental HERO")
        )
        .map((card) => card as Monster) || []
    );
  }

  private halveLifePoints(): void {
    const controller = this.card.controller;
    controller.updateLifePoints(-~~(controller.lifePoints / 2));
  }

  private selectMonster(monster: Monster): void {
    this.target = monster;
    const controller = this.card.controller;
    global.DUEL.actionSelection = controller.field
      .getFreeMonsterZones()
      .map(
        (zone) =>
          new ZoneSelect(controller, zone, (zone) =>
            this.specialSummonToZone(zone)
          )
      );
  }

  private specialSummonToZone(zone: Zone): void {
    if (this.target) {
      Utils.removeItemFromArray(this.target.controller.graveyard, this.target);
      zone.card = this.target;
      this.target.controller = this.card.controller;
      this.target.turnPositionUpdated = global.DUEL.turn;

      new CardMoveEvent(
        this.card.controller,
        this.target,
        Place.Graveyard,
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
          new BattlePositionSelect(this.card.controller, position, (position) =>
            this.chooseBattlePosition(position)
          )
      );
    } else AHeroLivesEffect1.logger.warn("Target is not set");
  }

  private chooseBattlePosition(position: BattlePosition): void {
    if (this.target) this.target.setPosition(position);
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
