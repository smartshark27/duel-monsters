import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Attack from "../actions/Attack";
import QuickEffect from "./QuickEffect";

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
    const lastAction = global.DUEL.lastAction;
    return (
      super.canActivate() &&
      this.card.wasSetBeforeThisTurn() &&
      lastAction instanceof Attack &&
      lastAction.actor !== this.card.controller
    );
  }

  override resolve(): void {
    super.resolve();
    global.DUEL.getOpponentOf(this.card.controller)
      .field.getMonsters()
      .forEach((monster) => monster.destroy());

    this.card.sendToGraveyard();
  }
}
