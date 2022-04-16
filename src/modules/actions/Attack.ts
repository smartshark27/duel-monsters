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
    attacker.attacksRemaining--;
  }
}
