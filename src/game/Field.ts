import LoggerFactory from "../util/LoggerFactory";
import Util from "../util/Util";
import Card from "./Card";
import Monster from "./cards/Monster";
import MonsterZone from "./field/MonsterZone";
import Player from "./Player";
import Zone from "./field/Zone";
import SpellTrapZone from "./field/SpellTrapZone";

export default class Field {
  monsterZones: MonsterZone[] = [];
  spellTrapZones: SpellTrapZone[] = [];
  private static logger = LoggerFactory.getLogger("Field");

  constructor(private owner: Player) {
    Field.logger.debug(`Creating field`);

    for (let i = 0; i < 5; i++) {
      this.monsterZones.push(new MonsterZone(owner, i));
      this.spellTrapZones.push(new SpellTrapZone(owner, i));
    }
  }

  getCards(): Card[] {
    return this.getMonsters();
  }

  getMonsters(): Monster[] {
    return this.monsterZones.flatMap((zone) =>
      zone.isEmpty() ? [] : zone.card
    ) as Monster[];
  }

  getFreeMonsterZones(): MonsterZone[] {
    return this.monsterZones.filter((zone) => zone.isEmpty());
  }

  getZonesWithMonsters(): MonsterZone[] {
    return this.monsterZones.filter((zone) => !zone.isEmpty());
  }

  getFreeSpellTrapZones(): SpellTrapZone[] {
    return this.spellTrapZones.filter((zone) => zone.isEmpty());
  }

  getRandomFreeMonsterZone(): MonsterZone | null {
    const freeZones = this.getFreeMonsterZones();
    if (freeZones) {
      return Util.getRandomItemFromArray(freeZones);
    }
    return null;
  }

  getRandomFreeSpellTrapZone(): SpellTrapZone | null {
    const freeZones = this.getFreeSpellTrapZones();
    if (freeZones) {
      return Util.getRandomItemFromArray(freeZones);
    }
    return null;
  }

  getZoneOf(card: Card): Zone | undefined {
    const zone = (this.monsterZones as Zone[]).concat(this.spellTrapZones).find((zone) => zone.card === card);
    if (!zone) {
      Field.logger.warn(`Could not find card ${card} on field`);
    }
    return zone;
  }

  toString(): string {
    return `${this.owner}'s field`;
  }
}
