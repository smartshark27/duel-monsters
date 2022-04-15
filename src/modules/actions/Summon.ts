import Card from "../Card";
import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Action from "./Action";

export default class Summon extends Action {
  protected static override logger = LoggerFactory.getLogger("Summon");

  constructor(actor: Player, card: Card) {
    super(actor, card);
  }
}
