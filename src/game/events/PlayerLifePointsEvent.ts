import { LifePointsChangeMethod } from "../../enums";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import DuelEvent from "../DuelEvent";
import Effect from "../Effect";
import Player from "../Player";

export default class PlayerLifePointsEvent extends DuelEvent {
  protected static override logger = LoggerFactory.getLogger("PlayerLifePointsEvent");

  constructor(
    actor: Player,
    public player: Player,
    public change: number,
    public how: LifePointsChangeMethod,
    public by: Card,
    public effect?: Effect
  ) {
    super(actor);
  }

  toString(): string {
    return `Life points for ${this.player} have changed by ${this.change} from ${this.how} by ${this.by}`;
  }
}
