import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import QuickEffect from "../effects/QuickEffect";
import {
  BattlePhaseStep,
  BattlePosition,
  MoveMethod,
  Place,
} from "../../enums";
import CardMoveEvent from "../events/CardMoveEvent";
import DuelEvent from "../DuelEvent";

export default class MirrorForceEffects extends Effects {
  protected static logger = LoggerFactory.getLogger("MirrorForceEffects");

  constructor(card: Card) {
    super(card);
    this.effects.push(new MirrorForceEffect(card));
  }
}

class MirrorForceEffect extends QuickEffect {
  protected static logger = LoggerFactory.getLogger(
    "DestroyAllOpponentsMonstersQuickEffect"
  );

  constructor(card: Card) {
    super(card);
  }

  override canActivate(events: DuelEvent[]): boolean {
    return (
      super.canActivate(events) &&
      global.DUEL.battlePhaseStep === BattlePhaseStep.Battle &&
      !this.card.controller.isTurnPlayer() &&
      global.DUEL.attack !== null &&
      this.card.wasSetBeforeThisTurn()
    );
  }

  override resolve(): void {
    super.resolve();

    global.DUEL.getOpponentOf(this.card.controller)
      .field.getMonsters()
      .filter((monster) => monster.position === BattlePosition.Attack)
      .forEach((monster) => {
        monster.destroy();
        new CardMoveEvent(
          this.card.controller,
          monster,
          Place.Field,
          Place.Graveyard,
          MoveMethod.DestroyedByEffect,
          this.card,
          this
        );
      });

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
    ).publish();
  }
}
