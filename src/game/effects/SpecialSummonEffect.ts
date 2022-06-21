import LoggerFactory from "../../utils/LoggerFactory";
import SpecialSummon from "../actions/SpecialSummon";
import Card from "../Card";
import Monster from "../cards/Monster";
import Effect from "../Effect";

export default class SpecialSummonEffect extends Effect {
  protected static logger = LoggerFactory.getLogger("SpecialSummonEffect");

  constructor(card: Card) {
    super(card, 1);
  }

  canActivate(): boolean {
    return this.card.controller.canPlayMonster();
  }

  getSpecialSummonActions(): SpecialSummon[] {
    return [new SpecialSummon(this.card.controller, this.card as Monster)];
  }
}
