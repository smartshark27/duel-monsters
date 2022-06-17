import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import NormalSummon from "./NormalSummon";
import CardTarget from "./CardTarget";
import ZoneSelect from "./ZoneSelect";
import CardMoveEvent from "../events/CardMoveEvent";
import { MoveMethod, Place } from "../../enums";

export default class TributeSummon extends NormalSummon {
  protected static override logger = LoggerFactory.getLogger("TributeSummon");
  private tributesRemaining = 0;

  constructor(actor: Player, protected monster: Monster) {
    super(actor, monster);
    this.tributesRemaining = monster.getTributesRequired();
  }

  override perform(): void {
    TributeSummon.logger.info(`Performing action ${this}`);
    this.actor.normalSummonsRemaining--;
    this.setActionSelection(
      this.actor.field
        .getMonsters()
        .map(
          (monsterToTribute) =>
            new CardTarget(this.actor, monsterToTribute, (monsterToTribute) =>
              this.tributeMonster(monsterToTribute as Monster)
            )
        )
    );
  }

  tributeMonster(monsterToTribute: Monster): void {
    monsterToTribute.sendToGraveyard();
    new CardMoveEvent(
      this.actor,
      monsterToTribute,
      Place.Field,
      Place.Graveyard,
      MoveMethod.Tributed,
      this.monster
    ).publish();
    this.tributesRemaining--;

    const actions =
      this.tributesRemaining > 0
        ? this.actor.field
            .getMonsters()
            .map(
              (monsterToTribute) =>
                new CardTarget(
                  this.actor,
                  monsterToTribute,
                  (monsterToTribute) =>
                    this.tributeMonster(monsterToTribute as Monster)
                )
            )
        : this.actor.field
            .getFreeMonsterZones()
            .map(
              (zone) =>
                new ZoneSelect(this.actor, zone, (zone) =>
                  this.normalSummonToZone(zone)
                )
            );

    this.setActionSelection(actions);
  }

  override toString(): string {
    return `Tribute summon ${this.card}`;
  }

  protected override getSummonEvent(): CardMoveEvent {
    return new CardMoveEvent(
      this.actor,
      this.monster,
      Place.Hand,
      Place.Field,
      MoveMethod.TributeSummoned
    );
  }
}
