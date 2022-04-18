import LoggerFactory from "../util/LoggerFactory";
import readline from "readline";

export default class Input {
  private static logger = LoggerFactory.getLogger("Input");
  private static commandLineArgs = process.argv.slice(2);

  static checkFlag(flag: string): boolean {
    return this.commandLineArgs.some(arg => arg === flag);
  }

  static getUserInput(question: string) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    return new Promise((resolve) =>
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      })
    );
  }
}
