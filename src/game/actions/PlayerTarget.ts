import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Action from "../Action";

export default class PlayerTarget extends Action {
  protected static override logger = LoggerFactory.getLogger("PlayerTarget");

  constructor(
    actor: Player,
    private target: Player,
    private callback: (_: Player) => void
  ) {
    super(actor);
  }

  override perform(): void {
    super.perform();
    this.callback(this.target);
  }

  override toString(): string {
    return `Target ${this.target}`;
  }
}
