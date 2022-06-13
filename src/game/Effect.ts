import LoggerFactory from "../utils/LoggerFactory";
import Card from "./Card";

export default class Effect {
  protected static logger = LoggerFactory.getLogger("Effect");

  constructor(public card: Card, public speed: number) {}

  activate(): void {}

  cleanup(): void {}

  toString(): string {
    return this.card.getName() + " effect";
  }
}
