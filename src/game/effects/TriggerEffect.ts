import LoggerFactory from "../../utils/LoggerFactory";
import ActivationEffect from "./ActivationEffect";
import Card from "../Card";

export default class TriggerEffect extends ActivationEffect {
  protected static logger = LoggerFactory.getLogger("TriggerEffect");

  constructor(card: Card) {
    super(card, 1);
  }
}
