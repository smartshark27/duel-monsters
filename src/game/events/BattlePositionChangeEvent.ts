import { CardFace, BattlePosition, BattlePositionChangeMethod } from "../../enums";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Monster from "../cards/Monster";
import DuelEvent from "../DuelEvent";
import Effect from "../Effect";
import Player from "../Player";

export default class BattlePositionChangeEvent extends DuelEvent {
  protected static override logger = LoggerFactory.getLogger(
    "BattlePositionChangeEvent"
  );

  constructor(
    actor: Player,
    public monster: Monster,
    public oldPosition: BattlePosition,
    public oldVisibility: CardFace,
    public newPosition: BattlePosition,
    public newVisibility: CardFace,
    public how: BattlePositionChangeMethod,
    public by?: Card,
    public effect?: Effect
  ) {
    super(actor);
  }

  toString(): string {
    return `${this.monster} was changed to face ${this.newVisibility} ${this.newPosition} position`;
  }
}
