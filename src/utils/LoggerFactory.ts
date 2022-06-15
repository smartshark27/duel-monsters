import winston from "winston";
import Input from "./Input";

export default class LoggerFactory {
  private static logger = winston.createLogger({
    level: Input.checkFlag("debug") ? "debug" : "info",
    transports: [
      new winston.transports.Console({
        format: winston.format.printf((options) => {
          return `[${options.name}] ${options.level}: ${options.message}`;
        }),
      }),
    ],
  });

  static getLogger(name: string) {
    return this.logger.child({ name: name });
  }
}
