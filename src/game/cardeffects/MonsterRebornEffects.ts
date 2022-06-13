import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Monster from "../cards/Monster";
import CardTarget from "../actions/CardTarget";
import IgnitionEffect from "../effects/IgnitionEffect";
import Activation from "../actions/Activation";
import ZoneSelect from "../actions/ZoneSelect";
import Zone from "../field/Zone";
import Utils from "../../utils/Utils";
import CardMoveEvent from "../events/CardMoveEvent";
import { CardFace, MoveMethod, Place } from "../../enums";

export default class MonsterRebornEffects extends Effects {
  protected static logger = LoggerFactory.getLogger("MonsterRebornEffects");

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new MonsterRebornEffect(card));
  }
}

class MonsterRebornEffect extends IgnitionEffect {
  protected static logger = LoggerFactory.getLogger("ResurrectionEffect");
  private monster: Monster | null = null;

  constructor(card: Card) {
    super(card);
  }

  override reset(): void {
    this.monster = null;
  }

  override canActivate(): boolean {
    return (
      super.canActivate() &&
      this.card.isInHand() &&
      this.card.controller.canPlaySpellTrap() &&
      this.getGraveyardMonsters().length > 0 &&
      this.card.controller.field.getFreeMonsterZones().length > 0
    );
  }

  override getActivationActions(): Activation[] {
    const actions = super.getActivationActions();
    actions.push(new Activation(this.card.controller, this));
    return actions;
  }

  override activate(): void {
    super.activate();
    const controller = this.card.controller;

    global.DUEL.actionSelection = controller.field
      .getFreeSpellTrapZones()
      .map(
        (zone) =>
          new ZoneSelect(controller, zone, (zone) => this.activateToZone(zone))
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

  protected override activateToZone(zone: Zone): void {
    super.activateToZone(zone);
    const controller = this.card.controller;
    global.DUEL.actionSelection = this.getGraveyardMonsters().map(
      (monster) =>
        new CardTarget(controller, monster, (monster) =>
          this.targetGraveyardMonster(monster as Monster)
        )
    );
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
      this.card.visibility = CardFace.Up;
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
    } else MonsterRebornEffect.logger.warn("Target is not set");
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
    );
  }

  private getGraveyardMonsters(): Monster[] {
    const player = this.card.controller;
    const opponent = global.DUEL.getOpponentOf(player);
    return player.graveyard
      .concat(opponent.graveyard)
      .filter((card) => card instanceof Monster) as Monster[];
  }
}
