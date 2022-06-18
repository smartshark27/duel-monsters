import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Action from "../Action";
import { BattlePosition } from "../../enums";

export default class BattlePositionSelect extends Action {
  protected static override logger = LoggerFactory.getLogger("BattlePositionSelect");

  constructor(
    actor: Player,
    private position: BattlePosition,
    private callback: (_: BattlePosition) => void
  ) {
    super(actor);
  }

  override perform(): void {
    super.perform();
    this.callback(this.position);
  }

  override toString(): string {
    return `Summon in ${this.position} position`;
  }
}
