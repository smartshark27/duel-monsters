import LoggerFactory from "../utils/LoggerFactory";
import ActivationEffect from "./effects/ActivationEffect";

export default class Chain {
  protected static logger = LoggerFactory.getLogger("Chain");
  links: ActivationEffect[] = [];
  effectsToCleanup: ActivationEffect[] = [];
  isResolving = false;
  passCount = 0;
  speed = 0;

  addLink(effect: ActivationEffect) {
    this.links.push(effect);
    this.speed = effect.speed;
  }

  resolveNext(): void {
    const effect = this.links.pop();
    if (effect) {
      this.effectsToCleanup.push(effect);
      effect.resolve();
    }
  }

  cleanup(): void {
    Chain.logger.info("Chain has resolved");
    this.isResolving = false;
    this.effectsToCleanup.forEach((effect) => effect.cleanup());
    this.speed = 0;
  }

  getLength(): number {
    return this.links.length;
  }

  includes(effect: ActivationEffect): boolean {
    return this.links.includes(effect);
  }

  toString(): string {
    return `${this.links}`;
  }
}
