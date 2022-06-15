import LoggerFactory from "../../utils/LoggerFactory";
import Card from "../Card";

export default class Spell extends Card {
  protected static override logger = LoggerFactory.getLogger("Spell");
}
