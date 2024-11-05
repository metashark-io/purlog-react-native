import { PurLogEnv } from "../../enums/PurLogEnv";
import { PurLogLevel } from "../../enums/PurLogLevel";
import { PurLogError } from "../PurLogError";
import { SecureStorageWrapper } from "../SecureStorageWrapper";
import { SessionTokenManager } from "./sessionTokens";

/** @internal */
export async function postLog(
    projectId: string,
    env: PurLogEnv,
    logLevel: PurLogLevel,
    message: string,
    metadata: Record<string, string>,
    deviceInfo: Record<string, string>,
    appVersion: string
  ): Promise<void> {
    try {
      // Retrieve projectJWT
      const projectJWT = await SecureStorageWrapper.instance.get("PurLogProjectJWT");
      if (!projectJWT) {
        throw PurLogError.error("Failed to create log", "Invalid or missing project JWT");
      }
  
      // Retrieve sessionJWT
      const sessionJWT = await SecureStorageWrapper.instance.get("PurLogSessionJWT");
      if (!sessionJWT) {
        throw PurLogError.error("Failed to create log", "Invalid or missing session JWT");
      }
  
      // Refresh token if expired
      await SessionTokenManager.instance.refreshToken(projectJWT, sessionJWT, projectId);
  
      const logData = {
        projectJWT,
        sessionJWT,
        projectId,
        message,
        level: logLevel,
        env,
        deviceInfo,
        metadata,
        appVersion,
        sdk: "typescript"
      };
  
      const response = await fetch("https://us-central1-purlog-45f7f.cloudfunctions.net/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(logData)
      });
  
      if (!response.ok) {
        throw PurLogError.error("Failed to create log", `Bad response: ${response.statusText}`);
      }
    } catch (error: any) {
      if (error instanceof PurLogError) {
        throw error;
      } else {
        throw PurLogError.error("Failed to create log", error.message || "Unknown error");
      }
    }
  }