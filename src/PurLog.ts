import { postLog } from "./core/api/logs";
import { SessionTokenManager } from "./core/api/sessionTokens";
import { SdkLogger } from "./core/SdkLogger";
import { SecureStorageWrapper } from "./core/SecureStorageWrapper";
import { PurLogEnv } from "./enums/PurLogEnv";
import { PurLogLevel } from "./enums/PurLogLevel";
import { PurLogConfig } from "./models/PurLogConfig";
import { PurLogDeviceInfo } from "./models/PurLogDeviceInfo";
import { appVersion } from "./utils/appVersion";
import { refreshTokenIfExpired } from "./utils/jwt";
import { shouldLog } from "./utils/logging";

class PurLog {
    private static _instance: PurLog;
    private config: PurLogConfig = { level: PurLogLevel.VERBOSE, env: PurLogEnv.DEV };
    private deviceInfo = new PurLogDeviceInfo()
    private isInitialized = false;
  
    private constructor() {}
  
    public static instance(): PurLog {
      if (!PurLog._instance) {
        PurLog._instance = new PurLog();
      }
      return PurLog._instance;
    }
  
    public async initialize(config: PurLogConfig): Promise<void> {
      if (this.isInitialized) {
        throw new Error("Initialization failed: Already initialized");
      }
  
      this.config = config;
      SdkLogger.instance.log(PurLogLevel.VERBOSE, "Initializing PurLog...");
      SdkLogger.instance.log(PurLogLevel.DEBUG, `config: ${JSON.stringify(config)}`);
  
      const { projectId } = config;
      if (!projectId) {
        SdkLogger.instance.log(PurLogLevel.INFO, "PurLog Initialized without projectId");
        this.isInitialized = true;
        return;
      }
  
      // Retrieve project JWT
      const projectJWT = await SecureStorageWrapper.instance.get("PurLogProjectJWT");
      if (!projectJWT) {
        throw new Error("Failed to initialize PurLog: Invalid project JWT");
      }
  
      // Retrieve or create UUID
      let uuid = await SecureStorageWrapper.instance.get("PurLogSessionUUID");
      if (!uuid) {
        SdkLogger.instance.log(PurLogLevel.VERBOSE, "PurLogSessionUUID not found. Creating a new one...");
        uuid = this.createUUID();
        await SecureStorageWrapper.instance.save("PurLogSessionUUID", uuid);
        SdkLogger.instance.log(PurLogLevel.VERBOSE, "PurLogSessionUUID created.");
      }
  
      // Retrieve or create session token
      let sessionJWT = await SecureStorageWrapper.instance.get("PurLogSessionJWT");
      if (!sessionJWT) {
        sessionJWT = await SessionTokenManager.instance.createToken(projectJWT, uuid, projectId);
        if (!sessionJWT) {
          throw new Error("Failed to initialize PurLog: Unable to create session token");
        }
      }
  
      // Refresh token if needed
      await refreshTokenIfExpired(projectJWT, sessionJWT, projectId);
      SdkLogger.instance.log(PurLogLevel.INFO, `PurLog initialized with projectId ${projectId}!`);
      this.isInitialized = true;
    }
  
    private createUUID(): string {
      // Replace with a proper UUID generation
      return 'xxxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
  
    private async log(level: PurLogLevel, message: string, metadata: Record<string, string> = {}): Promise<void> {
      if (!this.isInitialized) {
        SdkLogger.instance.log(PurLogLevel.ERROR, "Log failed. PurLog must be initialized");
        return;
      }
      if (!shouldLog(level, this.config.level)) return;
  
      // Console log or send to backend
      SdkLogger.instance.consoleLog(
        this.config.env,
        level,
        message,
        metadata,
        false
      )  
      const { projectId, env } = this.config;
      if (projectId) {
        await postLog(projectId, env, level, message, metadata, this.deviceInfo.asDictionary(), appVersion);
      }
    }

    // Log level methods
    public verbose(message: string, metadata: Record<string, string> = {}) {
      return this.log(PurLogLevel.VERBOSE, message, metadata);
    }
  
    public debug(message: string, metadata: Record<string, string> = {}) {
      return this.log(PurLogLevel.DEBUG, message, metadata);
    }
  
    public info(message: string, metadata: Record<string, string> = {}) {
      return this.log(PurLogLevel.INFO, message, metadata);
    }
  
    public warn(message: string, metadata: Record<string, string> = {}) {
      return this.log(PurLogLevel.WARN, message, metadata);
    }
  
    public error(message: string, metadata: Record<string, string> = {}) {
      return this.log(PurLogLevel.ERROR, message, metadata);
    }
  
    public fatal(message: string, metadata: Record<string, string> = {}) {
      return this.log(PurLogLevel.FATAL, message, metadata);
    }
  }