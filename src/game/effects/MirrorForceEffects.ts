import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Attack from "../actions/Attack";
import QuickEffect from "./QuickEffect";
import { Phase, Step, Timing } from "../../enums";

export default class MirrorForceEffect extends Effects {
  protected static logger = LoggerFactory.getLogger("MirrorForceEffect");

  constructor(card: Card) {
    super(card);
    this.effects.push(new DestroyAllOpponentsMonstersQuickEffect(card));
  }
}

class DestroyAllOpponentsMonstersQuickEffect extends QuickEffect {
  protected static logger = LoggerFactory.getLogger(
    "DestroyAllOpponentsMonstersQuickEffect"
  );

  constructor(card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    return (
      super.canActivate() &&
      this.card.wasSetBeforeThisTurn() &&
      global.DUEL.phase === Phase.Battle &&
      global.DUEL.step === Step.Battle &&
      global.DUEL.timing === Timing.StartDamageStep &&
      global.DUEL.getActivePlayer() !== this.card.controller
    );
  }

  override resolve(): void {
    super.resolve();
    global.DUEL.getOpponentOf(this.card.controller)
      .field.getMonsters()
      .forEach((monster) => monster.destroy());
  }

  override cleanup(): void {
    super.cleanup();
    this.card.sendToGraveyard();
  }
}
