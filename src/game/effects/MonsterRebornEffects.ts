import Effects from "../Effects";
import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Monster from "../cards/Monster";
import IgnitionEffect from "./IgnitionEffect";
import Utils from "../../utils/Utils";
import CardTarget from "../actions/CardTarget";

export default class MonsterRebornEffects extends Effects {
  protected static logger = LoggerFactory.getLogger("MonsterRebornEffects");

  constructor(protected card: Card) {
    super(card);
    this.effects.push(new ResurrectionEffect(card));
  }
}

class ResurrectionEffect extends IgnitionEffect {
  protected static logger = LoggerFactory.getLogger("ResurrectionEffect");
  target: Monster | null = null;

  constructor(card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    return false;
    // return (
    //   super.canActivate() &&
    //   ((this.card.inHand() && this.card.controller.canPlaySpellTrap()) ||
    //     this.card.wasSetBeforeThisTurn()) &&
    //   this.getGraveyardMonsters().length > 0 &&
    //   this.card.controller.field.getFreeMonsterZones().length > 0
    // );
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

    global.DUEL.actionSelection = this.getGraveyardMonsters().map(
      (monster) =>
        new CardTarget(controller, monster, (card) =>
          this.setTarget(card as Monster)
        )
    );
  }

  override resolve(): void {
    super.resolve();
    // const controller = this.card.controller;
    // const monsterZone = controller.field.getRandomFreeMonsterZone();

    // if (this.target && monsterZone) {
    //   ResurrectionEffect.logger.info(`Special summoning ${this.target}`);
    //   this.target.controller = controller;
    //   monsterZone.card = this.target;
    //   Utils.removeItemFromArray(this.target.owner.graveyard, this.target);
    // } else
    //   ResurrectionEffect.logger.warn(
    //     `Can no longer special summon ${this.target}`
    //   );
    // this.target = null;
  }

  override cleanup(): void {
    super.cleanup();
    this.card.sendToGraveyard();
  }

  private getGraveyardMonsters(): Monster[] {
    const opponent = global.DUEL.getOpponentOf(this.card.controller);
    return this.card.controller.graveyard
      .concat(opponent.graveyard)
      .filter((card) => card instanceof Monster) as Monster[];
  }

  private setTarget(monster: Monster): void {
    this.target = monster;
  }
}
