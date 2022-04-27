import LoggerFactory from "../../util/LoggerFactory";
import ActivationEffect from "./ActivationEffect";
import Card from "../Card";

export default class QuickEffect extends ActivationEffect {
  protected static logger = LoggerFactory.getLogger("QuickEffect");

  constructor(card: Card) {
    super(card, 2);
  }
}