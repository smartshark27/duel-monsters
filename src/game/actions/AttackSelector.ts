import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import ActionSelector from "./ActionSelector";

export default class AttackSelector extends ActionSelector {
  protected static override logger = LoggerFactory.getLogger("AttackSelector");

  constructor(actor: Player, private monster: Monster) {
    super(actor);
  }

  override perform(): void {
    super.perform();
    this.setActionSelection(this.monster.getAttackActions());
  }

  override toString(): string {
    return `Attack using ${this.monster}`;
  }
}
