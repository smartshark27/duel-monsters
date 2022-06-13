import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Utils from "../../utils/Utils";
import CardTarget from "../actions/CardTarget";
import QuickEffect from "../effects/QuickEffect";

export default class MysticalSpaceTyphoonEffects extends Effects {
  protected static logger = LoggerFactory.getLogger(
    "MysticalSpaceTyphoonEffects"
  );

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new DestroySpellTrapQuickEffect(card));
  }
}

class DestroySpellTrapQuickEffect extends QuickEffect {
  protected static logger = LoggerFactory.getLogger(
    "DestroySpellTrapQuickEffect"
  );
  target: Card | null = null;

  constructor(card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    return false;
    // const opponent = global.DUEL.getOpponentOf(this.card.controller);
    // return super.canActivate() && opponent.field.getSpellTraps().length > 0;
  }

  override activate(): void {
    super.activate();
    const controller = this.card.controller;
    if (this.card.isInHand()) {
      const zone = Utils.getRandomItemFromArray(
        controller.field.getFreeSpellTrapZones()
      );
      if (zone) {
        zone.card = this.card;
        Utils.removeItemFromArray(controller.hand, this.card);
      }
    }

    const opponent = global.DUEL.getOpponentOf(controller);
    global.DUEL.actionSelection = opponent.field
      .getSpellTraps()
      .map(
        (card) => new CardTarget(controller, card, (card) => this.setTarget(card))
      );
  }

  override resolve(): void {
    super.resolve();
    if (this.target) {
      this.target.destroy();
    } else
      DestroySpellTrapQuickEffect.logger.warn(
        `Can no longer destroy ${this.target}`
      );
    this.target = null;
  }

  override cleanup(): void {
    super.cleanup();
    this.card.sendToGraveyard();
  }

  private setTarget(card: Card): void {
    this.target = card;
  }
}
