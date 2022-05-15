import { CardFace } from "../enums";
import LoggerFactory from "../utils/LoggerFactory";
import Card from "./Card";

export default class Effect {
  protected static logger = LoggerFactory.getLogger("Effect");

  constructor(public card: Card, public speed: number) {}

  activate(): void {
    this.card.visibility = CardFace.Up;
    this.card.activating = true;
  }

  resolve(): void {}

  after(): void {
    this.card.activating = false;
  }

  toString(): string {
    return this.card.getName() + " effect";
  }
}
