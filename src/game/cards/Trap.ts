import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../util/LoggerFactory";
import Action from "../Action";
import SpellTrapSet from "../actions/SpellTrapSet";
import Card from "../Card";
import SpellTrapZone from "../field/SpellTrapZone";
import Player from "../Player";

export default class Trap extends Card {
  protected static override logger = LoggerFactory.getLogger("Trap");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }

  override getSpeed1Actions(): Action[] {
    const actions = super.getSpeed1Actions();
    if (this.canSet()) {
      actions.push(this.getSetAction());
    }
    return actions;
  }

  override getSpeed2Actions(): Action[] {
    const actions = [];
    if (this.canActivate()) {
      actions.push(this.getSetAction());
    }
    return actions;
  }

  private canSet(): boolean {
    return this.controller.canSetSpellTrap();
  }

  private getSetAction(): SpellTrapSet {
    return new SpellTrapSet(
      this.controller,
      this,
      this.controller.field.getRandomFreeSpellTrapZone() as SpellTrapZone
    );
  }

  private canActivate(): boolean {
    // return this.effect?.canActivate() as boolean;
    // TODO: Add trap position and turn set
    return false;
  }
}
