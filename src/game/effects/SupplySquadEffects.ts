import Effects from "../Effects";
import LoggerFactory from "../../util/LoggerFactory";
import Card from "../Card";
import TriggerEffect from "./TriggerEffect";
import IgnitionEffect from "./IgnitionEffect";
import Util from "../../util/Util";

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
      this.card.controller.canPlaySpellTrap() &&
      this.card.inHand()
    );
  }

  override activate(): void {
    super.activate();
    const controller = this.card.controller;
    const zone = Util.getRandomItemFromArray(
      controller.field.getFreeSpellTrapZones()
    );
    if (zone) {
      zone.card = this.card;
      Util.removeItemFromArray(controller.hand, this.card);
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
    return this.card.onField() && this.turnLastActivated < global.DUEL.turn;
  }

  override activate(): void {
    super.activate();
    this.turnLastActivated = global.DUEL.turn;
  }

  override resolve(): void {
    // TODO: Draw card
  }
}
