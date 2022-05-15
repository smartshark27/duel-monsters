import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Monster from "../cards/Monster";
import SpecialSummon from "../actions/SpecialSummon";
import MonsterZone from "../field/MonsterZone";
import IgnitionEffect from "./IgnitionEffect";
import Utils from "../../utils/Utils";

export default class MonsterRebornEffects extends Effects {
  protected static logger = LoggerFactory.getLogger("MonsterRebornEffects");

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new ResurrectionEffect(card));
  }
}

class ResurrectionEffect extends IgnitionEffect {
  protected static logger = LoggerFactory.getLogger("ResurrectionEffect");

  constructor(card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    return (
      super.canActivate() &&
      ((this.card.inHand() && this.card.controller.canPlaySpellTrap()) ||
        this.card.wasSetBeforeThisTurn()) &&
      this.getGraveyardMonsters().length > 0 &&
      this.card.controller.field.getFreeMonsterZones().length > 0
    );
  }

  override activate(): void {
    super.activate();
    const controller = this.card.controller;
    if (this.card.inHand()) {
      const zone = Utils.getRandomItemFromArray(
        controller.field.getFreeSpellTrapZones()
      );
      if (zone) {
        zone.card = this.card;
        Utils.removeItemFromArray(controller.hand, this.card);
      }
    }
  }

  override resolve(): void {
    super.resolve();
    const controller = this.card.controller;
    global.DUEL.actionSelection = this.getGraveyardMonsters().map(
      (monster) =>
        new SpecialSummon(
          controller,
          monster as Monster,
          controller.field.getRandomFreeMonsterZone() as MonsterZone,
          this
        )
    );
  }

  override after(): void {
    super.after();
    this.card.sendToGraveyard();
  }

  private getGraveyardMonsters(): Monster[] {
    const opponent = global.DUEL.getOpponentOf(this.card.controller);
    return this.card.controller.graveyard
      .concat(opponent.graveyard)
      .filter((card) => card instanceof Monster) as Monster[];
  }
}
