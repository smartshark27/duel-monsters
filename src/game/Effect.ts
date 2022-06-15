import { CardFace } from "../enums";
import LoggerFactory from "../utils/LoggerFactory";
import Card from "./Card";

export default class Effect {
  protected static logger = LoggerFactory.getLogger("Effect");

  constructor(public card: Card, public speed: number) {}

  reset(): void {}

  activate(): void {
    this.reset();
    this.card.visibility = CardFace.Up;
  }

  cleanup(): void {}

  toString(): string {
    return this.card.name + " effect";
  }
}
