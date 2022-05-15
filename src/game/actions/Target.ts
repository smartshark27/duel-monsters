import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Action from "../Action";
import Card from "../Card";

export default class Target extends Action {
  protected static override logger = LoggerFactory.getLogger("Target");
  override isFromActivation = true;

  constructor(
    actor: Player,
    private targetCard: Card,
    private callback: (_: Card) => void
  ) {
    super(actor);
  }

  override perform(): void {
    super.perform();
    this.callback(this.targetCard);
  }

  override toString(): string {
    return `Target ${this.targetCard}`;
  }
}
