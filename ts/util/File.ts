import LoggerFactory from "../util/LoggerFactory";
import { PathOrFileDescriptor, readFileSync } from "fs";

export default class File {
  private static logger = LoggerFactory.getLogger("File");

  static read(filename: PathOrFileDescriptor) {
    File.logger.debug(`Reading file ${filename}`);
    return readFileSync(filename, "utf8");
  }
}
