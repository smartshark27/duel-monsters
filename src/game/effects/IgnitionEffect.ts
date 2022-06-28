import LoggerFactory from "../../utils/LoggerFactory";
import ActivationEffect from "./ActivationEffect";
import Card from "../Card";
import { Phase } from "../../enums";
import DuelEvent from "../DuelEvent";

export default class IgnitionEffect extends ActivationEffect {
  protected static override logger = LoggerFactory.getLogger("IgnitionEffect");

  constructor(card: Card) {
    super(card, 1);
  }

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      [Phase.Main1, Phase.Main2].includes(global.DUEL.phase) &&
      !global.DUEL.isDuringTiming()
    );
  }
}
