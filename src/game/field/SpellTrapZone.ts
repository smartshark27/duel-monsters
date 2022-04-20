import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Zone from "./Zone";

export default class SpellTrapZone extends Zone {
  protected static override logger = LoggerFactory.getLogger("SpellTrapZone");

  constructor(owner: Player, private index: number) {
    super(owner);
    SpellTrapZone.logger.debug(`Creating spell/trap zone ${index}`);
  }
}
