import { CardFace } from "../enums";
import LoggerFactory from "../util/LoggerFactory";
import Card from "./Card";

export default class Effect {
  protected static logger = LoggerFactory.getLogger("Effect");

  constructor(public card: Card, public speed: number) {}

  canActivate(): boolean {
    return false;
  }

  activate(): void {
    this.card.visibility = CardFace.Up;
    this.card.activated = true;
  }

  resolve(): void {}

  after(): void {
    this.card.activated = false;
  }

  toString(): string {
    return this.card.data.description || "No effect";
  }
}
