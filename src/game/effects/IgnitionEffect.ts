import LoggerFactory from "../../utils/LoggerFactory";
import ActivationEffect from "./ActivationEffect";
import Card from "../Card";
import { Phase } from "../../enums";

export default class IgnitionEffect extends ActivationEffect {
  protected static logger = LoggerFactory.getLogger("IgnitionEffect");

  constructor(card: Card) {
    super(card, 1);
  }

  override canActivate(): boolean {
    return [Phase.Main1, Phase.Main2].includes(global.DUEL.phase);
  }
}
