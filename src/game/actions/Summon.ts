import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Action from "../Action";
import Monster from "../cards/Monster";

export default class Summon extends Action {
  protected static override logger = LoggerFactory.getLogger("Summon");

  constructor(actor: Player, protected card: Monster) {
    super(actor);
  }
}
