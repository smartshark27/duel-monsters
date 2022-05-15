import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Zone from "./Zone";

export default class MonsterZone extends Zone {
  protected static override logger = LoggerFactory.getLogger("MonsterZone");

  constructor(owner: Player, private index: number) {
    super(owner);
    MonsterZone.logger.debug(`Creating monster zone ${index}`);
  }
}
