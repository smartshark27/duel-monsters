import winston from "winston";

export default class LoggerFactory {
  private static logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.printf((options) => {
          return `[${options.name}] ${options.level}: ${options.message}`;
        }),
      }),
    ],
  });

  static getLogger(name: String) {
    return this.logger.child({ name: name });
  }
}
