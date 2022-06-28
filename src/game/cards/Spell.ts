import { SpellType } from "../../enums";
import CardData from "../../interfaces/CardData";
import LoggerFactory from "../../utils/LoggerFactory";
import Action from "../Action";
import SpellTrapSet from "../actions/SpellTrapSet";
import Card from "../Card";
import AHeroLivesEffects from "../cardeffects/AHeroLivesEffects";
import EEmergencyCallEffects from "../cardeffects/EEmergencyCallEffects";
import HarpiesFeatherDusterEffects from "../cardeffects/HarpiesFeatherDusterEffects";
import MaskChangeEffects from "../cardeffects/MaskChangeEffects";
import MonsterRebornEffects from "../cardeffects/MonsterRebornEffects";
import MysticalSpaceTyphoonEffects from "../cardeffects/MysticalSpaceTyphoonEffects";
import RaigekiEffects from "../cardeffects/RaigekiEffects";
import SupplySquadEffects from "../cardeffects/SupplySquadEffects";
import Player from "../Player";

export default class Spell extends Card {
  protected static override logger = LoggerFactory.getLogger("Spell");
  type: SpellType;

  constructor(
    public owner: Player,
    protected originalName: string,
    public data: CardData
  ) {
    super(owner, originalName, data);
    this.type = data.spellType as SpellType;
  }

  protected override getSpeed1Actions(): Action[] {
    const actions = super.getSpeed1Actions();
    if (this.canSet()) actions.push(this.getSetAction());
    return actions;
  }

  protected override canSet(): boolean {
    return super.canSet() && this.controller.canPlaySpellTrap();
  }

  protected override setEffects(): void {
    if (this.originalName === "A Hero Lives")
      this.effects = new AHeroLivesEffects(this);
    else if (this.originalName === "E - Emergency Call")
      this.effects = new EEmergencyCallEffects(this);
    else if (this.originalName === "Harpie's Feather Duster")
      this.effects = new HarpiesFeatherDusterEffects(this);
    else if (this.originalName === "Mask Change")
      this.effects = new MaskChangeEffects(this);
    else if (this.originalName === "Monster Reborn")
      this.effects = new MonsterRebornEffects(this);
    else if (this.originalName === "Mystical Space Typhoon")
      this.effects = new MysticalSpaceTyphoonEffects(this);
    else if (this.originalName === "Raigeki")
      this.effects = new RaigekiEffects(this);
    else if (this.originalName === "Supply Squad")
      this.effects = new SupplySquadEffects(this);
    else super.setEffects();
  }

  private getSetAction(): SpellTrapSet {
    return new SpellTrapSet(this.controller, this);
  }
}
