import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import SpecialSummonEffect from "../effects/SpecialSummonEffect";

export default class ElementalHEROBubblemanEffects extends Effects {
  protected static logger = LoggerFactory.getLogger(
    "ElementalHEROStratosEffects"
  );

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new ElementalHEROBubblemanEffect1(card));
  }
}

class ElementalHEROBubblemanEffect1 extends SpecialSummonEffect {
  protected static logger = LoggerFactory.getLogger(
    "ElementalHEROBubblemanEffect1"
  );

  override canActivate(): boolean {
    return (
      super.canActivate() &&
      this.card.isInHand() &&
      this.card.controller.hand.length === 1
    );
  }

  override toString(): string {
    return `${this.card.name} special summon effect`;
  }
}
