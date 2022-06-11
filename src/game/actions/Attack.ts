import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import { BattleStepTiming, TargetMethod } from "../../enums";
import Action from "../Action";
import Target from "./Target";
import TargetCardEvent from "../events/TargetCardEvent";

export default class Attack extends Action {
  protected static override logger = LoggerFactory.getLogger("Attack");

  constructor(actor: Player, private monster: Monster) {
    super(actor);
  }

  override perform(): void {
    super.perform();
    const opponent = global.DUEL.getOpponentOf(this.actor);
    this.setActionSelection(
      opponent.field
        .getMonsters()
        .map(
          (monster) =>
            new Target(this.actor, monster, (monster) =>
              this.attackMonster(monster as Monster)
            )
        )
    );
  }

  attackMonster(monster: Monster): void {
    this.monster.attacksRemaining--;
    new TargetCardEvent(
      this.actor,
      monster,
      TargetMethod.Attack,
      this.monster
    ).publish();
    global.DUEL.battleStepTiming = BattleStepTiming.AttackDeclarationWindow;
  }

  override toString(): string {
    return `Attack using ${this.monster}`;
  }
}
