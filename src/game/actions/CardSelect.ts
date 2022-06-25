import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Action from "../Action";
import Card from "../Card";

export default class CardSelect extends Action {
  protected static override logger = LoggerFactory.getLogger("CardSelect");

  constructor(
    actor: Player,
    private target: Card,
    private callback: (_: Card) => void
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
