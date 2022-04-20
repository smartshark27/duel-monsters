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
    return this.card.owner.graveyard.some((card) => card instanceof Monster);
  }

  override activate(): void {
    const owner = this.card.owner;
    const opponent = global.DUEL.getInactivePlayer();
    owner.actionSelection = owner.graveyard
      // .concat(opponent.graveyard) # TODO: Implement controllers
      .filter((card) => card instanceof Monster)
      .map(
        (monster) =>
          new SpecialSummon(
            owner,
            monster as Monster,
            owner.field.getRandomFreeMonsterZone() as MonsterZone,
            () => this.card.sendToGraveyard()
          )
      );
  }
}
