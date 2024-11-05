import { PurLogLevel } from "../enums/PurLogLevel";

/** @internal */
export function shouldLog(logLevel: PurLogLevel, configLevel: PurLogLevel): boolean {
    const levels = [
      PurLogLevel.VERBOSE,
      PurLogLevel.DEBUG,
      PurLogLevel.INFO,
      PurLogLevel.WARN,
      PurLogLevel.ERROR,
      PurLogLevel.FATAL
    ];
    const currentIndex = levels.indexOf(configLevel);
    const messageIndex = levels.indexOf(logLevel);
    return messageIndex >= currentIndex;
  }