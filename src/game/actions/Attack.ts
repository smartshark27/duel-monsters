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
  private target: Monster | Player | undefined;
  private destroyedMonsters: Monster[] = [];

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
    this.target = monster;
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
    this.target = player;
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

  applyDamageCalculation(): void {
    Attack.logger.info("Applying damage calculation");
    if (this.target instanceof Monster)
      this.performMonsterAttackDamageCalculation(this.target as Monster);
    else if (this.target instanceof Player)
      this.performDirectAttackDamageCalculation(this.target as Player);
    else Attack.logger.warn(`Attack target was not set`);
  }

  destroyMonsters(): void {
    this.destroyedMonsters.forEach((monster) => monster.destroy());
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

  private performMonsterAttackDamageCalculation(target: Monster): void {
    const opponent = global.DUEL.getOpponentOf(this.actor);
    const diff = this.monster.getAttackPoints() - target.getAttackPoints();
    if (diff > 0) {
      opponent.updateLifePoints(-diff);
      this.destroyedMonsters.push(target);
    } else if (diff < 0) {
      this.actor.updateLifePoints(diff);
      this.destroyedMonsters.push(this.monster);
    } else {
      this.destroyedMonsters.push(target);
      this.destroyedMonsters.push(this.monster);
    }
  }

  private performDirectAttackDamageCalculation(target: Player): void {
    target.updateLifePoints(-this.monster.getAttackPoints());
  }
}
