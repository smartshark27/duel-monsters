import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../utils/LoggerFactory";
import Action from "../Action";
import Card from "../Card";
import Player from "../Player";
import SpellTrapSet from "../actions/SpellTrapSet";

export default class Trap extends Card {
  protected static override logger = LoggerFactory.getLogger("Trap");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }

  protected override getSpeed1Actions(): Action[] {
    const actions = super.getSpeed1Actions();
    if (this.canSet()) actions.push(this.getSetAction());
    return actions;
  }

  protected canSet(): boolean {
    return super.canSet() && this.controller.canPlaySpellTrap();
  }

  private getSetAction(): SpellTrapSet {
    return new SpellTrapSet(this.controller, this);
  }
}
