import LoggerFactory from "../../utils/LoggerFactory";
import Player from "../Player";
import Action from "../Action";
import Zone from "../field/Zone";

export default class ZoneSelect extends Action {
  protected static override logger = LoggerFactory.getLogger("ZoneSelector");

  constructor(
    actor: Player,
    private zone: Zone,
    private callback: (_: Zone) => void
  ) {
    super(actor);
  }

  override perform(): void {
    super.perform();
    this.callback(this.zone);
  }

  override toString(): string {
    return `Select zone ${this.zone}`;
  }
}
