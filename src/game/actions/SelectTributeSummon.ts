import LoggerFactory from "../../util/LoggerFactory";
import Player from "../Player";
import Monster from "../cards/Monster";
import ActionSelector from "./ActionSelector";

export default class SelectTributeSummon extends ActionSelector {
  protected static override logger = LoggerFactory.getLogger(
    "SelectTributeSummon"
  );

  constructor(actor: Player, private monster: Monster) {
    super(actor);
  }

  override perform(): void {
    SelectTributeSummon.logger.info(
      `Selected to tribute summon ${this.monster}`
    );
    this.setActionSelection(this.monster.getTributeSummonActions());
  }

  override toString(): string {
    return `Tribute summon ${this.monster}`;
  }
}
