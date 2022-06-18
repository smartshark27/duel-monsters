import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import Action from "../Action";
import MonsterPositionChangeEvent from "../events/MonsterPositionChangeEvent";
import { MonsterPositionChangeMethod } from "../../enums";

export default class PositionChange extends Action {
  protected static override logger = LoggerFactory.getLogger("PositionChange");

  constructor(actor: Player, protected monster: Monster) {
    super(actor);
  }

  override perform(): void {
    super.perform();
    const oldPosition = this.monster.position;
    const oldVisibility = this.monster.visibility;
    this.monster.changePosition();
    new MonsterPositionChangeEvent(
      this.actor,
      this.monster,
      oldPosition,
      oldVisibility,
      this.monster.position,
      this.monster.visibility,
      MonsterPositionChangeMethod.Normal
    ).publish();
  }

  override toString(): string {
    return `Change battle position of ${this.monster}`;
  }
}
