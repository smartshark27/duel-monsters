import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import Action from "../Action";

export default class PositionChange extends Action {
  protected static override logger = LoggerFactory.getLogger("PositionChange");

  constructor(actor: Player, protected monster: Monster) {
    super(actor);
  }

  override perform(): void {
    super.perform();
    this.monster.changePosition();
  }

  override toString(): string {
    return `Change battle position of ${this.monster}`;
  }
}
