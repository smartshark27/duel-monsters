import Card from "../Card";
import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Action from "../Action";

export default class CardAction extends Action {
  protected static logger = LoggerFactory.getLogger("CardAction");

  constructor(actor: Player, protected card: Card) {
    super(actor);
  }
}
