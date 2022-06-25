import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import NormalSummon from "./NormalSummon";
import CardSelect from "./CardSelect";
import CardMoveEvent from "../events/CardMoveEvent";
import { BattlePosition, MoveMethod, Place } from "../../enums";

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
            new CardSelect(this.actor, monsterToTribute, (monsterToTribute) =>
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

    if (this.tributesRemaining > 0)
      this.setActionSelection(
        this.actor.field
          .getMonsters()
          .map(
            (monsterToTribute) =>
              new CardSelect(this.actor, monsterToTribute, (monsterToTribute) =>
                this.tributeMonster(monsterToTribute as Monster)
              )
          )
      );
    else this.selectPosition();
  }

  override toString(): string {
    return `Tribute summon ${this.monster}`;
  }

  protected override getSummonEvent(): CardMoveEvent {
    return new CardMoveEvent(
      this.actor,
      this.monster,
      Place.Hand,
      Place.Field,
      this.monster.position === BattlePosition.Attack
        ? MoveMethod.TributeSummoned
        : MoveMethod.TributeSet
    );
  }
}
