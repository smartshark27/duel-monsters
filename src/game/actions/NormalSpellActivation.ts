import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Spell from "../cards/Spell";
import SpellTrapZone from "../field/SpellTrapZone";
import Util from "../../util/Util";
import Activation from "./Activation";

export default class NormalSpellActivation extends Activation {
  protected static logger = LoggerFactory.getLogger("SpellActivation");

  constructor(actor: Player, card: Spell, private zone: SpellTrapZone) {
    super(actor, card);
  }

  override perform() {
    NormalSpellActivation.logger.info(`Activating normal spell ${this.card}`);
    this.zone.card = this.card;
    Util.removeItemFromArray(this.actor.hand, this.card);
    super.perform();
  }
}
