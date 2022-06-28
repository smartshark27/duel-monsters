import { Place } from "../../enums";
import LoggerFactory from "../../utils/LoggerFactory";
import DuelEvent from "../DuelEvent";
import Effect from "../Effect";
import Player from "../Player";

export default class ActivationEvent extends DuelEvent {
  protected static override logger = LoggerFactory.getLogger("ActivationEvent");

  constructor(actor: Player, public effect: Effect, public from: Place) {
    super(actor);
  }

  toString(): string {
    return `${this.effect} was activated from ${this.from} by ${this.actor}`;
  }
}
