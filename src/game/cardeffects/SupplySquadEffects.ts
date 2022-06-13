import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import IgnitionEffect from "../effects/IgnitionEffect";
import TriggerEffect from "../effects/TriggerEffect";
import Activation from "../actions/Activation";
import ZoneSelect from "../actions/ZoneSelect";
import Zone from "../field/Zone";
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

  override getActivationActions(): Activation[] {
    if (this.canActivate()) {
      const actions = super.getActivationActions();
      actions.push(new Activation(this.card.controller, this));
      return actions;
    }
    return [];
  }

  override activate(): void {
    super.activate();
    const controller = this.card.controller;
    global.DUEL.actionSelection = controller.field
      .getFreeSpellTrapZones()
      .map(
        (zone) =>
          new ZoneSelect(controller, zone, (zone) => this.activateToZone(zone))
      );
  }

  activateToZone(zone: Zone): void {
    Utils.removeItemFromArray(this.card.controller.hand, this.card);
    zone.card = this.card;
    global.DUEL.chain.addLink(this);
  }

  protected override canActivate(): boolean {
    return (
      super.canActivate() &&
      this.card.isInHand() &&
      this.card.controller.canPlaySpellTrap()
    );
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
