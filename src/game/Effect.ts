import { CardFace } from "../enums";
import LoggerFactory from "../util/LoggerFactory";
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
}
