import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import { BattleStepTiming, TargetMethod } from "../../enums";
import Action from "../Action";
import CardTarget from "./CardTarget";
import TargetCardEvent from "../events/TargetCardEvent";
import PlayerTarget from "./PlayerTarget";
import TargetPlayerEvent from "../events/TargetPlayerEvent";

export default class Attack extends Action {
  protected static override logger = LoggerFactory.getLogger("Attack");

  constructor(actor: Player, private monster: Monster) {
    super(actor);
  }

  override perform(): void {
    super.perform();
    const monsterAttackActions = this.getMonsterAttackActions();
    if (monsterAttackActions.length > 0)
      this.setActionSelection(monsterAttackActions);
    else this.setActionSelection([this.getDirectAttackAction()]);
  }

  attackMonster(monster: Monster): void {
    this.monster.attacksRemaining--;
    new TargetCardEvent(
      this.actor,
      monster,
      TargetMethod.Attack,
      this.monster
    ).publish();
    global.DUEL.attack = this;
    global.DUEL.battleStepTiming = BattleStepTiming.AttackDeclarationWindow;
  }

  attackDirectly(player: Player): void {
    this.monster.attacksRemaining--;
    new TargetPlayerEvent(
      this.actor,
      player,
      TargetMethod.Attack,
      this.monster
    ).publish();
    global.DUEL.attack = this;
    global.DUEL.battleStepTiming = BattleStepTiming.AttackDeclarationWindow;
  }

  override toString(): string {
    return `Attack using ${this.monster}`;
  }

  private getMonsterAttackActions(): CardTarget[] {
    const opponent = global.DUEL.getOpponentOf(this.actor);
    return opponent.field
      .getMonsters()
      .map(
        (monster) =>
          new CardTarget(this.actor, monster, (monster) =>
            this.attackMonster(monster as Monster)
          )
      );
  }

  private getDirectAttackAction(): PlayerTarget {
    const opponent = global.DUEL.getOpponentOf(this.actor);
    return new PlayerTarget(this.actor, opponent, (opponent) =>
      this.attackDirectly(opponent)
    );
  }
}
