import readline from "readline";

export default class Input {
  private static commandLineArgs = process.argv.slice(2);

  static checkFlag(flag: string): boolean {
    return this.commandLineArgs.some((arg) => arg.replace("--", "") === flag);
  }

  static getUserInput(
    question: string,
    handle: (_: string) => void = () => {}
  ) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) =>
      rl.question(question, (answer) => {
        rl.close();
        handle(answer);
        resolve(answer);
      })
    );
  }
}
