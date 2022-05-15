import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import QuickEffect from "./QuickEffect";
import Utils from "../../utils/Utils";

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

  constructor(card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    const opponent = global.DUEL.getOpponentOf(this.card.controller);
    return super.canActivate() && opponent.field.getSpellTraps().length > 0;
  }

  override activate(): void {
    super.activate();
    const controller = this.card.controller;
    if (this.card.inHand()) {
      const zone = Utils.getRandomItemFromArray(
        controller.field.getFreeSpellTrapZones()
      );
      if (zone) {
        zone.card = this.card;
        Utils.removeItemFromArray(controller.hand, this.card);
      }
    }
  }

  override resolve(): void {
    super.resolve();
    const opponent = global.DUEL.getOpponentOf(this.card.controller);
    // TODO: new Select(this.card.controller, card, this)
    // global.DUEL.actionSelection = opponent.field
    //   .getSpellTraps()
    //   .map((card) => new Destroy(this.card.controller, card, this));
  }

  override cleanup(): void {
    super.cleanup();
    this.card.sendToGraveyard();
  }
}
