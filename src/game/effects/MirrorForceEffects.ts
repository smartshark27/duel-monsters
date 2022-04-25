import Effects from "../Effects";
import LoggerFactory from "../../util/LoggerFactory";
import Card from "../Card";
import Attack from "../actions/Attack";
import QuickEffect from "./QuickEffect";
import { CardFace } from "../../enums";

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
      this.card.onField() &&
      this.card.visibility === CardFace.Down &&
      lastAction instanceof Attack &&
      lastAction.actor !== this.card.controller
    );
  }

  override resolve(): void {
    global.DUEL.getOpponentOf(this.card.controller)
      .field.getMonsters()
      .forEach((monster) => monster.destroy());
  }

  override after(): void {
    this.card.sendToGraveyard();
  }
}
