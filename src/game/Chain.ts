import LoggerFactory from "../utils/LoggerFactory";
import ActivationEffect from "./effects/ActivationEffect";

export default class Chain {
  protected static logger = LoggerFactory.getLogger("Chain");
  effects: ActivationEffect[] = [];
  effectsToCleanup: ActivationEffect[] = [];
  isResolving = false;
  speed = 0;

  addLink(effect: ActivationEffect) {
    this.effects.push(effect);
  }

  resolveNext(): void {
    const effect = this.effects.pop();
    if (effect) {
      this.effectsToCleanup.push(effect);
      effect.resolve();
    }

    if (this.getLength() === 0) {
      Chain.logger.info("Chain has resolved");
      this.isResolving = false;
      this.cleanup();
    }
  }

  cleanup(): void {
    this.effectsToCleanup.forEach(effect => effect.cleanup());
  }

  getLength(): number {
    return this.effects.length;
  }

  toString(): string {
    return `${this.effects}`;
  }
}
