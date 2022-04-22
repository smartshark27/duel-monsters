import Effect from "../Effect";
import LoggerFactory from "../../util/LoggerFactory";
import Card from "../Card";
import Monster from "../cards/Monster";
import SpecialSummon from "../actions/SpecialSummon";
import MonsterZone from "../field/MonsterZone";

export default class MonsterRebornEffect extends Effect {
  protected static logger = LoggerFactory.getLogger("MonsterRebornEffect");

  constructor(protected card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    return (
      this.getGraveyardMonsters().length > 0 &&
      this.card.controller.field.getFreeMonsterZones().length > 0
    );
  }

  override resolve(): void {
    const controller = this.card.controller;
    controller.actionSelection = this.getGraveyardMonsters().map(
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
    this.card.sendToGraveyard();
  }

  private getGraveyardMonsters(): Monster[] {
    const opponent = global.DUEL.getOpponentOf(this.card.controller);
    return this.card.controller.graveyard
      .concat(opponent.graveyard)
      .filter((card) => card instanceof Monster) as Monster[];
  }
}
