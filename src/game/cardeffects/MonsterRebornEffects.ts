import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Monster from "../cards/Monster";
import CardTarget from "../actions/CardTarget";
import IgnitionEffect from "../effects/IgnitionEffect";
import ZoneSelect from "../actions/ZoneSelect";
import Zone from "../field/Zone";
import Utils from "../../utils/Utils";
import CardMoveEvent from "../events/CardMoveEvent";
import { CardFace, BattlePosition, MoveMethod, Place } from "../../enums";
import BattlePositionSelect from "../actions/BattlePositionSelect";
import DuelEvent from "../DuelEvent";

export default class MonsterRebornEffects extends Effects {
  protected static logger = LoggerFactory.getLogger("MonsterRebornEffects");

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new MonsterRebornEffect(card));
  }
}

class MonsterRebornEffect extends IgnitionEffect {
  protected static logger = LoggerFactory.getLogger("MonsterRebornEffect");
  private monster: Monster | null = null;

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      (this.card.wasSetBeforeThisTurn() ||
        (this.card.isInHand() && this.card.controller.canPlaySpellTrap())) &&
      this.getGraveyardMonsters().length > 0 &&
      this.card.controller.field.getFreeMonsterZones().length > 0
    );
  }

  override activate(): void {
    const controller = this.card.controller;

    if (this.card.wasSetBeforeThisTurn()) {
      super.activate();
      global.DUEL.actionSelection = this.getGraveyardMonsters().map(
        (monster) =>
          new CardTarget(controller, monster, (monster) =>
            this.targetGraveyardMonster(monster as Monster)
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
    global.DUEL.actionSelection = this.getGraveyardMonsters().map(
      (monster) =>
        new CardTarget(this.card.controller, monster, (monster) =>
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
      this.monster.controller = this.card.controller;
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

      global.DUEL.actionSelection = [
        BattlePosition.Attack,
        BattlePosition.Defence,
      ].map(
        (position) =>
          new BattlePositionSelect(this.card.controller, position, (position) =>
            this.chooseBattlePosition(position)
          )
      );
    } else MonsterRebornEffect.logger.warn("Target is not set");
  }

  private chooseBattlePosition(position: BattlePosition): void {
    if (this.monster) this.monster.setPosition(position);
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

  private getGraveyardMonsters(): Monster[] {
    const player = this.card.controller;
    const opponent = global.DUEL.getOpponentOf(player);
    return player.graveyard
      .concat(opponent.graveyard)
      .filter((card) => card instanceof Monster) as Monster[];
  }
}
