import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Action from "../Action";
import MoveCardEvent from "../events/MoveCardEvent";
import { MoveMethod, Place } from "../../enums";
import ActivationEffect from "../effects/ActivationEffect";

export default class Draw extends Action {
  protected static logger = LoggerFactory.getLogger("Draw");

  constructor(actor: Player, private effect?: ActivationEffect) {
    super(actor);
  }

  override perform(): void {
    const card = this.actor.drawCard();
    if (card)
      new MoveCardEvent(
        this.actor,
        card,
        Place.Deck,
        Place.Hand,
        MoveMethod.Drawn,
        this.effect?.card,
        this.effect
      ).publish();
  }

  toString(): string {
    return "Draw";
  }
}
