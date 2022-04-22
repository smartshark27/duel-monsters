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
    // const opponent = global.DUEL.getOpponentOf(this.card.controller);
    // const lastAction: Action = global.DUEL.chain;
    // return (
    //   opponent.field.getMonsters().length > 0 &&
    //   lastAction instanceof Attack &&
    //   lastAction.actor === opponent
    // );
    return false;
  }

  override resolve(): void {
    global.DUEL.getOpponentOf(this.card.controller)
      .field.getMonsters()
      .forEach((monster) => monster.destroy());
  }
}
