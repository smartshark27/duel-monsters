import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import QuickEffect from "../effects/QuickEffect";
import {
  BattleStepTiming,
  MonsterPosition,
  MoveMethod,
  Place,
} from "../../enums";
import CardMoveEvent from "../events/CardMoveEvent";
import Activation from "../actions/Activation";

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
      !this.card.controller.isTurnPlayer() &&
      global.DUEL.battleStepTiming ===
        BattleStepTiming.AttackDeclarationWindow &&
      global.DUEL.attack !== null &&
      this.card.wasSetBeforeThisTurn()
    );
  }

  override getActivationActions(): Activation[] {
    const actions = super.getActivationActions();
    actions.push(new Activation(this.card.controller, this));
    return actions;
  }

  override resolve(): void {
    super.resolve();
    global.DUEL.getOpponentOf(this.card.controller)
      .field.getMonsters()
      .filter((monster) => monster.position === MonsterPosition.Attack)
      .forEach((monster) => monster.destroy());
    global.DUEL.attack = null;
  }

  override cleanup(): void {
    super.cleanup();
    this.card.sendToGraveyard();
    new CardMoveEvent(
      this.card.controller,
      this.card,
      Place.Field,
      Place.Graveyard,
      MoveMethod.Sent
    );
  }
}
