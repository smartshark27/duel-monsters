import LoggerFactory from "../util/LoggerFactory";

export default class Util {
  private static logger = LoggerFactory.getLogger("Util");

  static removeItemFromArray(array: any[], item: any) {
    const index = array.indexOf(item);
    array.splice(index, 1);
  }

  static shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  static getRandomItemFromArray(array: any[]) {
    return array[array.length * Math.random() | 0];
  }
}
