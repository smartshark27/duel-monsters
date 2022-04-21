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
    const controller = this.card.controller;
    return (
      controller.graveyard.some((card) => card instanceof Monster) &&
      controller.field.getFreeMonsterZones().length > 0
    );
  }

  override activate(): void {
    const controller = this.card.controller;
    // const opponent = global.DUEL.getInactivePlayer();
    controller.actionSelection = controller.graveyard
      // .concat(opponent.graveyard) # TODO: Check both graveyards
      .filter((card) => card instanceof Monster)
      .map(
        (monster) =>
          new SpecialSummon(
            controller,
            monster as Monster,
            controller.field.getRandomFreeMonsterZone() as MonsterZone,
            () => this.card.sendToGraveyard()
          )
      );
  }
}
