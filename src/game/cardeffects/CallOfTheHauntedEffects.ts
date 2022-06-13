import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";
import Monster from "../cards/Monster";
import Effects from "../Effects";
import QuickEffect from "../effects/QuickEffect";
import CardTarget from "../actions/CardTarget";

export default class CallOfTheHauntedEffects extends Effects {
  protected static logger = LoggerFactory.getLogger("CallOfTheHauntedEffects");

  constructor(card: Card) {
    super(card);
    this.effects.push(new ResurrectionEffect(card));
  }
}

class ResurrectionEffect extends QuickEffect {
  protected static logger = LoggerFactory.getLogger("ResurrectionEffect");
  target: Card | null = null;

  override canActivate(): boolean {
    return false;
    // return (
    //   super.canActivate() &&
    //   this.card.wasSetBeforeThisTurn() &&
    //   this.getGraveyardMonsters().length > 0 &&
    //   this.card.controller.field.getFreeMonsterZones().length > 0
    // );
  }

  override activate(): void {
    super.activate();
    const controller = this.card.controller;
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

  private getGraveyardMonsters(): Monster[] {
    return this.card.controller.graveyard.filter(
      (card) => card instanceof Monster
    ) as Monster[];
  }

  private setTarget(monster: Monster): void {
    this.target = monster;
  }
}

// TODO: Implement trigger effects

// class DestroyMonsterEffect extends TriggerEffect {
//   protected static logger = LoggerFactory.getLogger("DestroyMonsterEffect");

//   constructor(card: Card) {
//     super(card);
//   }

//   override canActivate(): boolean {
//     return (
//       super.canActivate() &&
//       this.card.onField() &&
//       this.card.visibility === CardFace.Up
//     );
//   }

//   override resolve(): void {
//     const controller = this.card.controller;
//   }
// }

// class DestroyThisEffect extends TriggerEffect {
//   protected static logger = LoggerFactory.getLogger("DestroyThisEffect");

//   constructor(card: Card) {
//     super(card);
//   }

//   override canActivate(): boolean {
//     return (
//       super.canActivate() &&
//       this.card.onField() &&
//       this.card.visibility === CardFace.Up
//     );
//   }

//   override resolve(): void {
//   }
// }
