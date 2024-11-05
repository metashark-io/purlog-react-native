import { PurLogLevel } from "../enums/PurLogLevel";
import { SdkLogger } from "./SdkLogger";

export class PurLogError extends Error {
    public title: string;
    public message: string;
  
    private constructor(title: string, message: string) {
      super(message); // Pass message to the base Error class
      this.title = title;
      this.message = message;
      Object.setPrototypeOf(this, PurLogError.prototype); // Necessary for custom Error class in TypeScript
    }
  
    public static error(title: string, message: string, logLevel: PurLogLevel = PurLogLevel.ERROR): PurLogError {
      SdkLogger.instance.log(logLevel, `${title}. ${message}`);
      return new PurLogError(title, message);
    }
  
    public static errorFromError(title: string, error: Error, logLevel: PurLogLevel = PurLogLevel.ERROR): PurLogError {
      const message = error.message;
      SdkLogger.instance.log(logLevel, `${title}. ${message}`);
      return new PurLogError(title, message);
    }
  }
