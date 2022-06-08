import LoggerFactory from "../utils/LoggerFactory";
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
    return (this.getMonsters() as Card[]).concat(this.getSpellTraps());
  }

  getMonsters(): Monster[] {
    return this.monsterZones
      .filter((zone) => !zone.isEmpty())
      .map((zone) => zone.card as Monster);
  }

  getSpellTraps(): Card[] {
    return this.spellTrapZones
      .filter((zone) => !zone.isEmpty())
      .map((zone) => zone.card as Card);
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

  getZoneOf(card: Card): Zone | undefined {
    return (this.monsterZones as Zone[])
      .concat(this.spellTrapZones)
      .find((zone) => zone.card === card);
  }

  toString(): string {
    return `${this.owner}'s field`;
  }
}
