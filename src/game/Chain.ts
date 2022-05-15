import LoggerFactory from "../utils/LoggerFactory";
import ActivationEffect from "./effects/ActivationEffect";

export default class Chain {
  protected static logger = LoggerFactory.getLogger("Chain");
  effects: ActivationEffect[] = [];
  isResolving = false;
  speed = 0;

  addLink(effect: ActivationEffect) {
    this.effects.push(effect);
  }

  resolveNext(): void {
    this.effects.pop()?.resolve();
    if (this.getLength() === 0) {
      Chain.logger.info("Chain has resolved");
      this.isResolving = false;
    }
  }

  getLength(): number {
    return this.effects.length;
  }

  toString(): string {
    return `${this.effects}`;
  }
}
