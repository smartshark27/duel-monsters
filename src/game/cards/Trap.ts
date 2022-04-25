import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../util/LoggerFactory";
import Action from "../Action";
import SpellTrapSet from "../actions/SpellTrapSet";
import Card from "../Card";
import SpellTrapZone from "../field/SpellTrapZone";
import Player from "../Player";
import { CardFace } from "../../enums";

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

  protected override canActivate(): boolean {
    return (
      super.canActivate() &&
      this.visibility === CardFace.Down &&
      this.turnSet > 0 &&
      this.turnSet < global.DUEL.turn
    );
  }

  private canSet(): boolean {
    return this.turnSet < 0 && this.controller.canSetSpellTrap();
  }

  private getSetAction(): SpellTrapSet {
    return new SpellTrapSet(
      this.controller,
      this,
      this.controller.field.getRandomFreeSpellTrapZone() as SpellTrapZone
    );
  }
}
