import winston from "winston";

export default class LoggerFactory {
  private static logger = winston.createLogger({
    level: 'debug',
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
