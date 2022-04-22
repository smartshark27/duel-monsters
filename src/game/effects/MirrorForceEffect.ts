import Effect from "../Effect";
import LoggerFactory from "../../util/LoggerFactory";
import Card from "../Card";
import Attack from "../actions/Attack";
import Action from "../Action";

export default class MirrorForceEffect extends Effect {
  protected static logger = LoggerFactory.getLogger("MirrorForceEffect");

  constructor(card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    // TODO: Implement action responses and chaining
    return false;
  }

  override resolve(): void {
    global.DUEL.getOpponentOf(this.card.controller)
      .field.getMonsters()
      .forEach((monster) => monster.destroy());
    this.card.sendToGraveyard();
  }
}
