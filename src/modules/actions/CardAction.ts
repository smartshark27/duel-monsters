import Card from "../Card";
import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Action from "./Action";

export default class CardAction extends Action {
  protected static logger = LoggerFactory.getLogger("CardAction");

  constructor(protected actor: Player, protected card: Card) {
    super(actor);
  }

  perform() {}
}
