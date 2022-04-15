import Card from "../Card";
import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";

export default class Action {
  protected static logger = LoggerFactory.getLogger("Field");
  protected actor: Player;
  protected card: Card;

  constructor(actor: Player, card: Card) {
    this.actor = actor;
    this.card = card;
  }
}
