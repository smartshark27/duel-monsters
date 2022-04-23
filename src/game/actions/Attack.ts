import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import CardAction from "./CardAction";

export default class Attack extends CardAction {
  protected static override logger = LoggerFactory.getLogger("Attack");

  constructor(
    actor: Player,
    monster: Monster,
    private target: Monster | Player
  ) {
    super(actor, monster);
  }

  override perform(): void {
    Attack.logger.info(`${this.card} is declaring attack against ${this.target}`);
  }

  override finalise(): void {
    const attacker = this.card as Monster;
    attacker.attacksRemaining--;
    if (!this.actor.field.getZoneOf(this.card)) {
      Attack.logger.debug(
        `Monster ${this.card} is no longer on field to make attack`
      );
      return;
    }
    if (this.target instanceof Player) {
      this.attackDirectly(attacker);
    } else {
      this.battle(attacker, this.target as Monster);
    }
  }

  private attackDirectly(attacker: Monster) {
    Attack.logger.info(`${attacker} is attacking ${this.target} directly`);
    (this.target as Player).receiveBattleDamage(attacker.getAttackPoints());
  }

  private battle(attacker: Monster, target: Monster) {
    Attack.logger.info(`${attacker} is attacking ${target}`);
    const attackerPoints = attacker.getAttackPoints();
    const targetPoints = target.getAttackPoints();
    const difference = attackerPoints - targetPoints;
    const opponent = global.DUEL.getOpponentOf(this.actor);
    if (difference > 0) {
      opponent.receiveBattleDamage(difference);
      target.destroyByBattle();
    } else if (difference < 0) {
      this.actor.receiveBattleDamage(-difference);
      attacker.destroyByBattle();
    } else {
      Attack.logger.info("Both monsters have the same attack points");
      target.destroyByBattle();
      attacker.destroyByBattle();
    }
  }

  override toString(): string {
    return `Attack ${this.target} using ${this.card}`;
  }
}
