import LoggerFactory from "../util/LoggerFactory";
import Card from "./Card";
import Player from "./Player";

export default class Effect {
  protected static logger = LoggerFactory.getLogger("Effect");

  constructor(protected card: Card) {}

  canActivate(): boolean {
    return false;
  }

  activate(): void {}

  toString(): string {
    return `${this.card} effect`;
  }
}
