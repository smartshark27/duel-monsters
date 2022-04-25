import LoggerFactory from "../../util/LoggerFactory";
import Card from "../Card";
import Monster from "../cards/Monster";
import SpecialSummon from "../actions/SpecialSummon";
import MonsterZone from "../field/MonsterZone";
import Effects from "../Effects";
import QuickEffect from "./QuickEffect";
import { CardFace } from "../../enums";
import TriggerEffect from "./TriggerEffect";

export default class CallOfTheHauntedEffects extends Effects {
  protected static logger = LoggerFactory.getLogger("CallOfTheHauntedEffects");

  constructor(card: Card) {
    super(card);
    this.effects.push(new ResurrectionEffect(card));
  }
}

class ResurrectionEffect extends QuickEffect {
  protected static logger = LoggerFactory.getLogger("ResurrectionEffect");

  constructor(card: Card) {
    super(card);
  }

  override canActivate(): boolean {
    return (
      super.canActivate() &&
      this.card.onField() &&
      this.card.visibility === CardFace.Down &&
      this.getGraveyardMonsters().length > 0 &&
      this.card.controller.field.getFreeMonsterZones().length > 0
    );
  }

  override resolve(): void {
    const controller = this.card.controller;
    global.DUEL.actionSelection = this.getGraveyardMonsters().map(
      (monster) =>
        new SpecialSummon(
          controller,
          monster as Monster,
          controller.field.getRandomFreeMonsterZone() as MonsterZone,
          this
        )
    );
  }

  private getGraveyardMonsters(): Monster[] {
    const opponent = global.DUEL.getOpponentOf(this.card.controller);
    return this.card.controller.graveyard
      .concat(opponent.graveyard)
      .filter((card) => card instanceof Monster) as Monster[];
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
