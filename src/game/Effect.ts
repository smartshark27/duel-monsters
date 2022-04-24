import LoggerFactory from "../util/LoggerFactory";
import Card from "./Card";

export default class Effect {
  protected static logger = LoggerFactory.getLogger("Effect");

  constructor(protected card: Card) {}

  canActivate(): boolean {
    return false;
  }

  activate(): void {}

  resolve(): void {}

  after(): void {}

  toString(): string {
    return this.card.data.description || "No effect";
  }
}
