import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Spell from "./Spell";

export default class NormalSpell extends Spell {
  protected static override logger = LoggerFactory.getLogger("NormalSpell");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }
}
