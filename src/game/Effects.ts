import LoggerFactory from "../utils/LoggerFactory";
import Activation from "./actions/Activation";
import Card from "./Card";
import DuelEvent from "./DuelEvent";
import Effect from "./Effect";
import ActivationEffect from "./effects/ActivationEffect";
import MandatoryTriggerEffect from "./effects/MandatoryTriggerEffect";
import OptionalTriggerEffect from "./effects/OptionalTriggerEffect";

export default class Effects {
  protected static logger = LoggerFactory.getLogger("Effects");
  protected effects: Effect[] = [];

  constructor(protected card: Card) {}

  getEffects(): Effect[] {
    return this.effects;
  }

  getActivationActions(speed: number): Activation[] {
    return (
      this.effects.filter(
        (effect) => effect instanceof ActivationEffect && effect.speed >= speed
      ) as ActivationEffect[]
    ).flatMap((effect) => (effect.canActivate()) ? effect.getActivationActions() : []);
  }

  getMandatoryTriggeredEffects(events: DuelEvent[]): MandatoryTriggerEffect[] {
    return this.effects.filter(
      (effect) =>
        effect instanceof MandatoryTriggerEffect && effect.isTriggered(events)
    ) as MandatoryTriggerEffect[];
  }

  getOptionalTriggeredEffects(events: DuelEvent[]): OptionalTriggerEffect[] {
    return this.effects.filter(
      (effect) =>
        effect instanceof MandatoryTriggerEffect && effect.isTriggered(events)
    ) as OptionalTriggerEffect[];
  }

  toString(): string {
    return this.card.data.description || "No effect";
  }
}
