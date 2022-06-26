import { CardType, MonsterAttribute, MonsterType, SpellType, TrapType } from "../enums";

export default interface CardData {
  cardType: CardType;
  spellType?: SpellType;
  trapType?: TrapType;
  attribute?: MonsterAttribute;
  level?: number;
  monsterTypes?: MonsterType[];
  attack?: number;
  defence?: number;
  description?: string;
}
