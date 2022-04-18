import Card from "../Card";
import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import CardAction from "./CardAction";

export default class Summon extends CardAction {
  protected static override logger = LoggerFactory.getLogger("Summon");

  constructor(actor: Player, card: Card) {
    super(actor, card);
  }
}
