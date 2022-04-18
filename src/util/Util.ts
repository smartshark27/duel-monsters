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

  static getRandomItemFromArray(array: any[]): any {
    return array[(array.length * Math.random()) | 0];
  }

  static getAllPairsFromArray(array: any[]): any[][] {
    // TODO: Make more efficient
    const pairs = [];
    for (let i = 0; i < array.length; i++) {
      for (let j = 0; i < array.length; i++) {
        if (i !== j) {
          pairs.push([array[i], array[j]]);
        }
      }
    }
    return pairs;
  }
}
