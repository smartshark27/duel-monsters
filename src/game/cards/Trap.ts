import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../utils/LoggerFactory";
import Action from "../Action";
import Card from "../Card";
import Player from "../Player";
import SpellTrapSet from "../actions/SpellTrapSet";
import CallOfTheHauntedEffects from "../cardeffects/CallOfTheHauntedEffects";
import MirrorForceEffects from "../cardeffects/MirrorForceEffects";
import ForcedBackEffects from "../cardeffects/ForcedBackEffects";

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

  protected override canSet(): boolean {
    return super.canSet() && this.controller.canPlaySpellTrap();
  }

  protected setEffects(): void {
    if (this.originalName === "Call of the Haunted")
      this.effects = new CallOfTheHauntedEffects(this);
    else if (this.originalName === "Forced Back")
      this.effects = new ForcedBackEffects(this);
    else if (this.originalName === "Mirror Force")
      this.effects = new MirrorForceEffects(this);
    else super.setEffects();
  }

  private getSetAction(): SpellTrapSet {
    return new SpellTrapSet(this.controller, this);
  }
}
