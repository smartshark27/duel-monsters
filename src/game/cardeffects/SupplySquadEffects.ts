import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import IgnitionEffect from "../effects/IgnitionEffect";
import Activation from "../actions/Activation";
import ZoneSelect from "../actions/ZoneSelect";
import Zone from "../field/Zone";
import Utils from "../../utils/Utils";
import MoveCardEvent from "../events/MoveCardEvent";
import { CardFace, MoveMethod, Place } from "../../enums";
import OptionalTriggerEffect from "../effects/OptionalTriggerEffect";
import DuelEvent from "../DuelEvent";
import Monster from "../cards/Monster";

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

  override canActivate(): boolean {
    return (
      super.canActivate() &&
      this.card.isInHand() &&
      this.card.controller.canPlaySpellTrap()
    );
  }

  override getActivationActions(): Activation[] {
    const actions = super.getActivationActions();
    actions.push(new Activation(this.card.controller, this));
    return actions;
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
    new MoveCardEvent(
      this.card.controller,
      this.card,
      Place.Hand,
      Place.Field,
      MoveMethod.Activated,
      this.card,
      this
    ).publish();
  }
}

class SupplySquadTriggerEffect extends OptionalTriggerEffect {
  protected static logger = LoggerFactory.getLogger("SupplySquadTriggerEffect");
  private turnLastActivated = -1;

  override getActivationActions(): Activation[] {
    const actions = super.getActivationActions();
    actions.push(new Activation(this.card.controller, this));
    return actions;
  }

  override activate(): void {
    super.activate();
    global.DUEL.chain.addLink(this);
    this.turnLastActivated = global.DUEL.turn;
  }

  override resolve(): void {
    super.resolve();

    const controller = this.card.controller;
    const drawnCard = controller.drawCard();
    if (drawnCard)
      new MoveCardEvent(
        controller,
        drawnCard,
        Place.Deck,
        Place.Hand,
        MoveMethod.Drawn,
        this.card,
        this
      ).publish();
  }

  override isTriggered(events: DuelEvent[]): boolean {
    return (
      this.card.isOnField() &&
      this.card.visibility === CardFace.Up &&
      this.turnLastActivated < global.DUEL.turn &&
      events.some((event) => {
        return (
          event instanceof MoveCardEvent &&
          event.card instanceof Monster &&
          event.card.controller === this.card.controller &&
          [MoveMethod.DestroyedByBattle, MoveMethod.DestroyedByEffect].includes(
            event.how
          )
        );
      })
    );
  }
}
