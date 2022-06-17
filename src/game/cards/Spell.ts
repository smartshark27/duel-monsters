import LoggerFactory from "../../utils/LoggerFactory";
import Action from "../Action";
import SpellTrapSet from "../actions/SpellTrapSet";
import Card from "../Card";

export default class Spell extends Card {
  protected static override logger = LoggerFactory.getLogger("Spell");

  protected override getSpeed1Actions(): Action[] {
    const actions = super.getSpeed1Actions();
    if (this.canSet()) actions.push(this.getSetAction());
    return actions;
  }

  protected override canSet(): boolean {
    return super.canSet() && this.controller.canPlaySpellTrap();
  }

  private getSetAction(): SpellTrapSet {
    return new SpellTrapSet(this.controller, this);
  }
}
