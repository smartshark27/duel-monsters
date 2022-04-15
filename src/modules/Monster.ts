import LoggerFactory from "../util/LoggerFactory";
import Card from "./Card";
import Player from "./Player";

export default class Monster extends Card {
  protected static override logger = LoggerFactory.getLogger("Monster");

  constructor(owner: Player, name: String) {
    super(owner, name);
  }
}
