import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Action from "../Action";

export default class ActionSelector extends Action {
  protected static override logger = LoggerFactory.getLogger(
    "ActionSelector"
  );

  constructor(actor: Player) {
    super(actor);
  }

  setPlayerActions(actions: Action[]): void {
    this.actor.actionSelection = actions;
  }
}
