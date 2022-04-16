import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Action from "./Action";
import Monster from "../Monster";

export default class Attack extends Action {
  protected static override logger = LoggerFactory.getLogger("Attack");

  constructor(actor: Player, monster: Monster, private target: Monster) {
    super(actor, monster);
  }

  override perform(): void {
    Attack.logger.info(`${this.card.name} is attacking ${this.target.name}`);
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
      inactivePlayer.takeBattleDamage(difference);
    } else if (difference < 0) {
      this.actor.takeBattleDamage(-difference);
    }
  }
}
