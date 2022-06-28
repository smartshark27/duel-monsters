import { Phase } from "../../enums";
import LoggerFactory from "../../utils/LoggerFactory";
import SpecialSummon from "../actions/SpecialSummon";
import Card from "../Card";
import Monster from "../cards/Monster";
import Effect from "../Effect";

export default class SpecialSummonEffect extends Effect {
  protected static override logger = LoggerFactory.getLogger("SpecialSummonEffect");

  constructor(card: Card) {
    super(card, 1);
  }

  canActivate(): boolean {
    const controller = this.card.controller;
    return (
      controller.isTurnPlayer() &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase) &&
      this.card.controller.canPlayMonster()
    );
  }

  getSpecialSummonActions(): SpecialSummon[] {
    return [new SpecialSummon(this.card.controller, this.card as Monster)];
  }
}
