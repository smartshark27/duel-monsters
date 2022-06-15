import { MoveMethod, Place } from "../../enums";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import DuelEvent from "../DuelEvent";
import Effect from "../Effect";
import Player from "../Player";

export default class CardMoveEvent extends DuelEvent {
  protected static logger = LoggerFactory.getLogger("CardMoveEvent");

  constructor(
    actor: Player,
    public card: Card,
    public from: Place,
    public to: Place,
    public how: MoveMethod,
    public by?: Card,
    public effect?: Effect
  ) {
    super(actor);
  }

  toString(): string {
    return `${this.card} was ${this.how} from ${this.from} to ${this.to}`;
  }
}
