import LoggerFactory from "../../utils/LoggerFactory";

export default class DrawCardEvent extends Event {
  protected static logger = LoggerFactory.getLogger("DrawCardEvent");

  toString(): string {
    return "DrawCardEvent";
  }
}
