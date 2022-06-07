import { TargetMethod } from "../../enums";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import DuelEvent from "../DuelEvent";
import Effect from "../Effect";
import Player from "../Player";

export default class TargetCardEvent extends DuelEvent {
  protected static logger = LoggerFactory.getLogger("TargetCardEvent");

  constructor(
    actor: Player,
    public card: Card,
    public how: TargetMethod,
    public by: Card,
    public effect?: Effect
  ) {
    super(actor);
  }

  toString(): string {
    return `${this.card} was targeted by ${this.by} for ${this.how}`;
  }
}
