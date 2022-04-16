import LoggerFactory from "../util/LoggerFactory";
import Util from "../util/Util";
import MonsterZone from "./MonsterZone";
import Player from "./Player";

export default class Field {
  private static logger = LoggerFactory.getLogger("Field");
  private owner: Player;
  private monsterZones: MonsterZone[] = [];

  constructor(owner: Player) {
    Field.logger.debug(`Creating field`);

    this.owner = owner;
    for (let i = 0; i < 5; i++) {
      this.monsterZones.push(new MonsterZone(owner, i))
    }
  }

  getRandomFreeMonsterZone() {
    const freeZones = this.getFreeMonsterZones();
    if (freeZones) {
      return Util.getRandomItemFromArray(this.getFreeMonsterZones());
    }
    return null;
  }

  getFreeMonsterZones() {
    return this.monsterZones.filter(zone => zone.isEmpty());
  }
}
