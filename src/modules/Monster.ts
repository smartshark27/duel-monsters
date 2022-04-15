import LoggerFactory from "../util/LoggerFactory";
import Action from "./actions/Action";
import NormalSummon from "./actions/NormalSummon";
import Card from "./Card";
import Player from "./Player";

export default class Monster extends Card {
  protected static override logger = LoggerFactory.getLogger("Monster");

  constructor(owner: Player, name: string) {
    super(owner, name);
  }

  override getActions(): Array<Action> {
    const possibleActions = [];
    if (this.canNormalSummon()) {
      possibleActions.push(new NormalSummon(this.owner, this))
    }
    return possibleActions;
  }

  canNormalSummon() {
    return false;
  }
}
