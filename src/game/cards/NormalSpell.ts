import { Phase } from "../../enums";
import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../util/LoggerFactory";
import Action from "../Action";
import NormalSpellActivation from "../actions/NormalSpellActivation";
import SpellTrapZone from "../field/SpellTrapZone";
import Player from "../Player";
import Spell from "./Spell";

export default class NormalSpell extends Spell {
  protected static override logger = LoggerFactory.getLogger("Spell");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }

  override getSpeed1Actions(): Action[] {
    const possibleActions = super.getSpeed2Actions();
    if (this.canActivate()) {
      possibleActions.push(this.getActivationAction());
    }
    return possibleActions;
  }

  protected override canActivate(): boolean {
    return (
      super.canActivate() &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase) &&
      this.controller.canPlaySpellTrap()
    );
  }

  private getActivationAction(): NormalSpellActivation {
    return new NormalSpellActivation(
      this.controller,
      this,
      this.controller.field.getRandomFreeSpellTrapZone() as SpellTrapZone
    );
  }
}
