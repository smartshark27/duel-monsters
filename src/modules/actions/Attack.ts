import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Monster from "../Monster";
import CardAction from "./CardAction";

export default class Attack extends CardAction {
  protected static override logger = LoggerFactory.getLogger("Attack");

  constructor(actor: Player, monster: Monster, private target: Monster) {
    super(actor, monster);
  }

  override perform(): void {
    Attack.logger.info(`${this.card} is attacking ${this.target}`);
    const attacker = this.card as Monster;
    this.battle(attacker);
    attacker.attacksRemaining--;
  }

  battle(attacker: Monster) {
    const attackerPoints = attacker.getAttackPoints();
    const targetPoints = this.target.getAttackPoints();
    const difference = attackerPoints - targetPoints;
    const inactivePlayer = global.DUEL.getInactivePlayer();
    if (difference > 0) {
      inactivePlayer.receiveBattleDamage(difference);
      this.target.destroyByBattle();
    } else if (difference < 0) {
      this.actor.receiveBattleDamage(-difference);
      attacker.destroyByBattle();
    } else {
      Attack.logger.info("Both monsters have the same attack points");
      this.target.destroyByBattle();
      attacker.destroyByBattle();
    }
  }

  override toString(): string {
    return `Attack ${this.target} using ${this.card}`;
  }
}
