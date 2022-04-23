import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../util/LoggerFactory";
import Action from "../Action";
import SpellTrapSet from "../actions/SpellTrapSet";
import TrapActivation from "../actions/TrapActivation";
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
    const actions = super.getSpeed2Actions();
    if (this.canActivate()) {
      actions.push(this.getActivationAction());
    }
    return actions;
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

  private getActivationAction(): TrapActivation {
    return new TrapActivation(this.controller, this);
  }

  private canActivate(): boolean {
    return (
      this.turnSet < global.DUEL.turnCounter &&
      (this.effect?.canActivate() as boolean)
    );
  }
}