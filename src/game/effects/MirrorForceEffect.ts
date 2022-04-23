import Effect from "../Effect";
import LoggerFactory from "../../util/LoggerFactory";
import Card from "../Card";
import Attack from "../actions/Attack";

export default class MirrorForceEffect extends Effect {
  protected static logger = LoggerFactory.getLogger("MirrorForceEffect");

  constructor(card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    const lastAction = global.DUEL.chain.at(-1);
    return (
      lastAction instanceof Attack && lastAction.actor !== this.card.controller
    );
  }

  override resolve(): void {
    global.DUEL.getOpponentOf(this.card.controller)
      .field.getMonsters()
      .forEach((monster) => monster.destroy());
    this.card.sendToGraveyard();
  }
}
