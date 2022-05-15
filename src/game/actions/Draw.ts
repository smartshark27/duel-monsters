import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Action from "../Action";

export default class Draw extends Action {
  protected static logger = LoggerFactory.getLogger("Draw");

  constructor(actor: Player) {
    super(actor);
  }

  override perform(): void {
    this.actor.drawCard();
  }

  toString(): string {
    return "Draw";
  }
}
