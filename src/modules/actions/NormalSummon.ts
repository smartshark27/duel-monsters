import Card from "../Card";
import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Action from "./Action";

export default class NormalSummon extends Action {
  protected static override logger = LoggerFactory.getLogger("NormalSummon");

  constructor(actor: Player, card: Card) {
    NormalSummon.logger.debug(`Normal summoning ${card.name}`);
    super(actor, card);
  }
}
