import LoggerFactory from "../utils/LoggerFactory";
import Activation from "./actions/Activation";
import SpecialSummon from "./actions/SpecialSummon";
import Card from "./Card";
import DuelEvent from "./DuelEvent";
import Effect from "./Effect";
import ActivationEffect from "./effects/ActivationEffect";
import MandatoryTriggerEffect from "./effects/MandatoryTriggerEffect";
import OptionalTriggerEffect from "./effects/OptionalTriggerEffect";
import SpecialSummonEffect from "./effects/SpecialSummonEffect";

export default class Effects {
  protected static logger = LoggerFactory.getLogger("Effects");
  protected effects: Effect[] = [];

  constructor(protected card: Card) {}

  reset(): void {
    this.effects.forEach((effect) => effect.reset());
  }

  getSpecialSummonActions(): SpecialSummon[] {
    return (
      this.effects.filter(
        (effect) => effect instanceof SpecialSummonEffect
      ) as SpecialSummonEffect[]
    ).flatMap((effect) =>
      effect.canActivate() ? effect.getSpecialSummonActions() : []
    );
  }

  getActivationActions(speed: number, events: DuelEvent[]): Activation[] {
    return (
      this.effects.filter(
        (effect) => effect instanceof ActivationEffect && effect.speed >= speed
      ) as ActivationEffect[]
    ).flatMap((effect) =>
      effect.canActivate(events) ? effect.getActivationActions() : []
    );
  }

  getMandatoryTriggeredActions(events: DuelEvent[]): Activation[] {
    return (
      this.effects.filter(
        (effect) =>
          effect instanceof MandatoryTriggerEffect && effect.canActivate(events)
      ) as MandatoryTriggerEffect[]
    ).flatMap((effect) => effect.getActivationActions());
  }

  getOptionalTriggeredActions(events: DuelEvent[]): Activation[] {
    return (
      this.effects.filter(
        (effect) =>
          effect instanceof OptionalTriggerEffect && effect.canActivate(events)
      ) as OptionalTriggerEffect[]
    ).flatMap((effect) => effect.getActivationActions());
  }

  toString(): string {
    return this.card.data.description || "No effect";
  }
}
