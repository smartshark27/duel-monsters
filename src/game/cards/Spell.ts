import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../util/LoggerFactory";
import Action from "../Action";
import SpellActivation from "../actions/SpellActivation";
import Card from "../Card";
import SpellTrapZone from "../field/SpellTrapZone";
import Player from "../Player";

export default class Spell extends Card {
  protected static override logger = LoggerFactory.getLogger("Spell");

  constructor(owner: Player, name: string, data: CardData) {
    super(owner, name, data);
  }

  override getActions(): Action[] {
    const possibleActions = [];
    if (this.canActivate()) {
      possibleActions.push(this.getActivationAction());
    }
    return possibleActions;
  }

  activate(): void {}

  private getActivationAction(): SpellActivation {
    return new SpellActivation(
      this.owner,
      this,
      this.owner.field.getRandomFreeSpellTrapZone() as SpellTrapZone
    );
  }

  private canActivate(): boolean {
    return this.owner.canActivateSpell();
  }
}
