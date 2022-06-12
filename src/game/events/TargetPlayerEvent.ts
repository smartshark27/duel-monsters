import { TargetMethod } from "../../enums";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import DuelEvent from "../DuelEvent";
import Effect from "../Effect";
import Player from "../Player";

export default class TargetPlayerEvent extends DuelEvent {
  protected static logger = LoggerFactory.getLogger("TargetPlayerEvent");

  constructor(
    actor: Player,
    public target: Player,
    public how: TargetMethod,
    public by: Card,
    public effect?: Effect
  ) {
    super(actor);
  }

  toString(): string {
    return `${this.target} was targeted by ${this.by} for ${this.how}`;
  }
}
