import LoggerFactory from "../../utils/LoggerFactory";
import Action from "../Action";

export default class ActionSelector extends Action {
  protected static override logger = LoggerFactory.getLogger("ActionSelector");

  protected setActionSelection(actions: Action[]) {
    global.DUEL.actionSelection = actions;
  }
}
