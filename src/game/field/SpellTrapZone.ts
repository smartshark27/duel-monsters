import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Zone from "./Zone";

export default class SpellTrapZone extends Zone {
  protected static override logger = LoggerFactory.getLogger("SpellTrapZone");

  constructor(owner: Player, private index: number) {
    super(owner);
    Zone.logger.info(`Creating ${this}`);
  }

  override toString(): string {
    return `${this.owner} spell & trap zone ${this.index}`;
  }
}
