import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../util/LoggerFactory";
import Action from "../Action";
import QuickPlaySpellActivation from "../actions/QuickPlaySpellActivation";
import SpellTrapZone from "../field/SpellTrapZone";
import Player from "../Player";
import Spell from "./Spell";

export default class QuickPlaySpell extends Spell {
  protected static override logger = LoggerFactory.getLogger("QuickPlaySpell");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }

  override getSpeed2Actions(): Action[] {
    const possibleActions = super.getSpeed2Actions();
    if (this.canActivate()) {
      possibleActions.push(this.getActivationAction());
    }
    return possibleActions;
  }

  protected override canActivate(): boolean {
    if (this.onField()) {
      // Set on field
      return (
        super.canActivate() &&
        this.turnSet > 0 &&
        this.turnSet < global.DUEL.turnCounter
      );
    }
    // In hand
    return super.canActivate() && this.controller.havingTurn;
  }

  private getActivationAction(): QuickPlaySpellActivation {
    if (this.onField()) {
      return new QuickPlaySpellActivation(this.controller, this);
    }
    return new QuickPlaySpellActivation(
      this.controller,
      this,
      this.controller.field.getRandomFreeSpellTrapZone() as SpellTrapZone
    );
  }
}
