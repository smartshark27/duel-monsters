import LoggerFactory from "../utils/LoggerFactory";
import Card from "./Card";
import Effect from "./Effect";
import ActivationEffect from "./effects/ActivationEffect";

export default class Effects {
  protected static logger = LoggerFactory.getLogger("Effects");
  protected effects: Effect[] = [];

  constructor(protected card: Card) {}

  getEffects(): Effect[] {
    return this.effects;
  }

  getActivationEffects(): ActivationEffect[] {
    return this.effects.filter(
      (effect) => effect instanceof ActivationEffect
    ) as ActivationEffect[];
  }

  toString(): string {
    return this.card.data.description || "No effect";
  }
}
