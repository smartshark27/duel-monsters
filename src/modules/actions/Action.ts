import Card from "../Card";
import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";

export default class Action {
  protected static logger = LoggerFactory.getLogger("Field");

  constructor(protected actor: Player, protected card: Card) {}

  perform() {}
}
