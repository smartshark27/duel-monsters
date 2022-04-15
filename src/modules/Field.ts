import LoggerFactory from "../util/LoggerFactory";
import Player from "./Player";

export default class Field {
  private static logger = LoggerFactory.getLogger("Field");
  private owner: Player;

  constructor(owner: Player) {
    Field.logger.debug(`Creating field`);

    this.owner = owner;
  }
}
