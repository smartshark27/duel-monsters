import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../util/LoggerFactory";
import Card from "../Card";
import Player from "../Player";

export default class Spell extends Card {
  protected static override logger = LoggerFactory.getLogger("Spell");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }
}
