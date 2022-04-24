import Effect from "../Effect";
import LoggerFactory from "../../util/LoggerFactory";
import Card from "../Card";
import Destroy from "../actions/Destroy";

export default class MysticalSpaceTyphoonEffect extends Effect {
  protected static logger = LoggerFactory.getLogger(
    "MysticalSpaceTyphoonEffect"
  );

  constructor(protected card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    const opponent = global.DUEL.getOpponentOf(this.card.controller);
    return opponent.field.getSpellTraps().length > 0;
  }

  override resolve(): void {
    const opponent = global.DUEL.getOpponentOf(this.card.controller);
    global.DUEL.actionSelection = opponent.field
      .getSpellTraps()
      .map((card) => new Destroy(this.card.controller, card, this));
  }

  override after(): void {
    this.card.sendToGraveyard();
  }
}
