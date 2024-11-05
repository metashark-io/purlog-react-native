import { PurLogEnv } from "../enums/PurLogEnv";
import { PurLogLevel } from "../enums/PurLogLevel";
import { PurLogConfig } from "../models/PurLogConfig";
import { getCurrentTimestamp } from "../utils/dates";
import { shouldLog } from "../utils/logging";

/** @internal */
export class SdkLogger {
    private static _instance: SdkLogger;
  
    private env: PurLogEnv = PurLogEnv.DEV;
    private configLevel: PurLogLevel = PurLogLevel.VERBOSE;
  
    private constructor() {}
  
    public static get instance(): SdkLogger {
      if (!SdkLogger._instance) {
        SdkLogger._instance = new SdkLogger();
      }
      return SdkLogger._instance;
    }
  
    public initialize(config: PurLogConfig): void {
      this.env = config.env;
      this.configLevel = config.level;
    }
  
    public log(level: PurLogLevel, message: string, metadata: Record<string, string> = {}): void {
      if (this.env !== PurLogEnv.DEV) return;
      if (!shouldLog(level, this.configLevel)) return;
      this.consoleLog(this.env, level, message, metadata, true);
    }
  
    public consoleLog(env: PurLogEnv, logLevel: PurLogLevel, message: string, metadata:  Record<string, string>, isInternal: boolean): void {
      if (env !== PurLogEnv.DEV) return;
  
      const formattedMessage = `[${getCurrentTimestamp()}] [${logLevel}]${isInternal ? ' [PurLog]' : ''} ${message}`;
      const formattedMessageWithMetadata = Object.keys(metadata).length
        ? `${formattedMessage}\n\nmetadata: ${JSON.stringify(metadata)}`
        : formattedMessage;
  
      switch (logLevel) {
        case PurLogLevel.VERBOSE:
          console.log(`⚪️ ${formattedMessageWithMetadata}`);
          break;
        case PurLogLevel.DEBUG:
          console.debug(`🔵 ${formattedMessageWithMetadata}`);
          break;
        case PurLogLevel.INFO:
          console.info(`🟢 ${formattedMessageWithMetadata}`);
          break;
        case PurLogLevel.WARN:
          console.warn(`🟡 ${formattedMessageWithMetadata}`);
          break;
        case PurLogLevel.ERROR:
          console.error(`🔴 ${formattedMessageWithMetadata}`);
          break;
        case PurLogLevel.FATAL:
          console.error(`🔴🔴🔴 ${formattedMessageWithMetadata}`);
          break;
      }
    }
}