import { CardType } from "./CardType";

export default interface CardData {
  cardType: CardType;
  attribute?: string;
  level?: number;
  monsterTypes?: String[];
  attack?: number;
  defence?: number;
}
