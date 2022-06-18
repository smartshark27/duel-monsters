import { CardFace, MonsterPosition, MonsterPositionChangeMethod } from "../../enums";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Monster from "../cards/Monster";
import DuelEvent from "../DuelEvent";
import Effect from "../Effect";
import Player from "../Player";

export default class MonsterPositionChangeEvent extends DuelEvent {
  protected static override logger = LoggerFactory.getLogger(
    "MonsterPositionChangeEvent"
  );

  constructor(
    actor: Player,
    public monster: Monster,
    public oldPosition: MonsterPosition,
    public oldVisibility: CardFace,
    public newPosition: MonsterPosition,
    public newVisibility: CardFace,
    public how: MonsterPositionChangeMethod,
    public by?: Card,
    public effect?: Effect
  ) {
    super(actor);
  }

  toString(): string {
    return `${this.monster} was changed to face ${this.newVisibility} ${this.newPosition} position`;
  }
}
