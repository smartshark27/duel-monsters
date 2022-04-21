import { Phase } from "../../enums";
import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../util/LoggerFactory";
import Action from "../Action";
import SpellActivation from "../actions/SpellActivation";
import SpellTrapSet from "../actions/SpellTrapSet";
import Card from "../Card";
import SpellTrapZone from "../field/SpellTrapZone";
import Player from "../Player";

export default class Trap extends Card {
  protected static override logger = LoggerFactory.getLogger("Trap");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }

  override getActions(): Action[] {
    const possibleActions = [];
    if (this.canSet()) {
      possibleActions.push(this.getSetAction());
    }
    return possibleActions;
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
}
