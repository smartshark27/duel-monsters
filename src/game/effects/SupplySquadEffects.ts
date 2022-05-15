import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import TriggerEffect from "./TriggerEffect";
import IgnitionEffect from "./IgnitionEffect";
import Utils from "../../utils/Utils";

export default class SupplySquadEffects extends Effects {
  protected static logger = LoggerFactory.getLogger("SupplySquadEffects");

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new SupplySquadTriggerEffect(card));
    this.effects.push(new SupplySquadPlayEffect(card));
  }
}

class SupplySquadPlayEffect extends IgnitionEffect {
  protected static logger = LoggerFactory.getLogger("SupplySquadPlayEffect");

  constructor(card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    return (
      super.canActivate() &&
      ((this.card.inHand() && this.card.controller.canPlaySpellTrap()) ||
        this.card.wasSetBeforeThisTurn())
    );
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
}

class SupplySquadTriggerEffect extends TriggerEffect {
  protected static logger = LoggerFactory.getLogger("SupplySquadTriggerEffect");

  private turnLastActivated = -1;

  constructor(card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    return false;
    // return this.card.onField() && this.turnLastActivated < global.DUEL.turn;
  }

  override activate(): void {
    super.activate();
    this.turnLastActivated = global.DUEL.turn;
  }

  override resolve(): void {
    super.resolve();
    this.card.controller.drawCard();
  }
}
