import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../utils/LoggerFactory";
import Action from "../Action";
import Card from "../Card";
import Player from "../Player";

export default class Spell extends Card {
  protected static override logger = LoggerFactory.getLogger("Spell");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }

  override getSpeed1Actions(): Action[] {
    const actions = super.getSpeed1Actions();
    // if (this.canSet()) {
    //   actions.push(this.getSetAction());
    // }
    return actions;
  }

  // private canSet(): boolean {
  //   return this.turnSet < 0 && this.controller.canSetSpellTrap();
  // }

  // private getSetAction(): SpellTrapSet {
  //   return new SpellTrapSet(
  //     this.controller,
  //     this,
  //     this.controller.field.getRandomFreeSpellTrapZone() as SpellTrapZone
  //   );
  // }
}
