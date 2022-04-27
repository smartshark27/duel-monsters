import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Spell from "./Spell";

export default class QuickPlaySpell extends Spell {
  protected static override logger = LoggerFactory.getLogger("QuickPlaySpell");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }

  protected override canActivate(): boolean {
    if (this.isSet()) {
      return super.canActivate() && this.turnSet < global.DUEL.turn;
    }
    return super.canActivate() && this.controller.havingTurn;
  }
}
