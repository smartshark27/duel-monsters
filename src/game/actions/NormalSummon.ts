import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import Utils from "../../utils/Utils";
import Summon from "./Summon";
import ZoneSelect from "./ZoneSelect";
import Zone from "../field/Zone";
import { BattlePosition, CardFace, MoveMethod, Place } from "../../enums";
import CardMoveEvent from "../events/CardMoveEvent";
import BattlePositionSelect from "./BattlePositionSelect";

export default class NormalSummon extends Summon {
  protected static override logger = LoggerFactory.getLogger("NormalSummon");

  constructor(actor: Player, protected monster: Monster) {
    super(actor, monster);
  }

  override perform(): void {
    super.perform();
    this.actor.normalSummonsRemaining--;
    this.selectPosition();
  }

  protected selectPosition(): void {
    this.setActionSelection(
      [BattlePosition.Attack, BattlePosition.Set].map(
        (position) =>
          new BattlePositionSelect(this.actor, position, (position) =>
            this.setPosition(position)
          )
      )
    );
  }

  protected setPosition(position: BattlePosition): void {
    this.monster.setPosition(position);

    this.setActionSelection(
      this.actor.field
        .getFreeMonsterZones()
        .map(
          (zone) =>
            new ZoneSelect(this.actor, zone, (zone) =>
              this.normalSummonOrSetToZone(zone)
            )
        )
    );
  }

  protected normalSummonOrSetToZone(zone: Zone) {
    Utils.removeItemFromArray(this.actor.hand, this.card);
    zone.card = this.card;
    this.getSummonEvent().publish();
    global.DUEL.summon = this;
  }

  override toString(): string {
    return `Normal summon or set ${this.card}`;
  }

  protected getSummonEvent(): CardMoveEvent {
    return new CardMoveEvent(
      this.actor,
      this.monster,
      Place.Hand,
      Place.Field,
      this.monster.position === BattlePosition.Attack
        ? MoveMethod.NormalSummoned
        : MoveMethod.Set
    );
  }
}
