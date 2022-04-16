import LoggerFactory from "../util/LoggerFactory";
import Card from "./Card";
import Player from "./Player";

export default class MonsterZone {
  card: Card | undefined;

  private static logger = LoggerFactory.getLogger("MonsterZone");
  private owner: Player;

  constructor(owner: Player, index: number) {
    MonsterZone.logger.debug(`Creating monster zone ${index}`);

    this.owner = owner;
  }

  isEmpty() {
    return !this.card;
  }
}
