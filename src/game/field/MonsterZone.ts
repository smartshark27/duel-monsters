import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Zone from "./Zone";

export default class MonsterZone extends Zone {
  protected static override logger = LoggerFactory.getLogger("MonsterZone");

  constructor(owner: Player, private index: number) {
    super(owner);
    Zone.logger.info(`Creating ${this}`);
  }

  override toString(): string {
    return `${this.owner} monster zone ${this.index}`;
  }
}
