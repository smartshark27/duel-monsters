import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import Action from "../Action";
import BattlePositionChangeEvent from "../events/BattlePositionChangeEvent";
import { BattlePositionChangeMethod } from "../../enums";

export default class BattlePositionChange extends Action {
  protected static override logger = LoggerFactory.getLogger("BattlePositionChange");

  constructor(actor: Player, protected monster: Monster) {
    super(actor);
  }

  override perform(): void {
    super.perform();
    const oldPosition = this.monster.position;
    const oldVisibility = this.monster.visibility;
    this.monster.changePosition();
    new BattlePositionChangeEvent(
      this.actor,
      this.monster,
      oldPosition,
      oldVisibility,
      this.monster.position,
      this.monster.visibility,
      BattlePositionChangeMethod.Normal
    ).publish();
  }

  override toString(): string {
    return `Change battle position of ${this.monster}`;
  }
}
