import { PurLogLevel } from "../../enums/PurLogLevel";
import { PurLogError } from "../PurLogError";
import { SdkLogger } from "../SdkLogger";
import { SecureStorageWrapper } from "../SecureStorageWrapper";

/** @internal */
export class SessionTokenManager {
    private static _instance: SessionTokenManager;
    public isRefreshing = false;
  
    private constructor() {}
  
    public static get instance(): SessionTokenManager {
      if (!SessionTokenManager._instance) {
        SessionTokenManager._instance = new SessionTokenManager();
      }
      return SessionTokenManager._instance;
    }
  
    public async createToken(projectJWT: string, uuid: string, projectId: string): Promise<string> {
        SdkLogger.instance.log(PurLogLevel.VERBOSE, "calling createToken");
        this.isRefreshing = true;
  
      const url = "https://us-central1-purlog-45f7f.cloudfunctions.net/api/session_tokens";
      const body = {
        projectJWT,
        uuid,
        projectId
      };
  
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
  
        if (response.status !== 200) {
          this.isRefreshing = false;
          throw PurLogError.error("Failed to create session JWT", "Non-200 status code.");
        }
  
        const data = await response.json();
        const newJwt = data.jwt;
  
        if (!newJwt) {
          this.isRefreshing = false;
          throw PurLogError.error("Failed to create session JWT", "Failed to parse the response.");
        }
  
        await SecureStorageWrapper.instance.save(newJwt, "PurLogSessionJWT");
        SdkLogger.instance.log(PurLogLevel.INFO, "Session JWT created!");
        this.isRefreshing = false;
        return newJwt;
      } catch (error: any) {
        this.isRefreshing = false;
        throw PurLogError.error("Failed to create session JWT", error.message || "Unknown error");
      }
    }
  
    public async refreshToken(projectJWT: string, sessionJWT: string, projectId: string): Promise<string> {
        SdkLogger.instance.log(PurLogLevel.VERBOSE, "refreshing session JWT...");
      this.isRefreshing = true;
  
      const url = "https://us-central1-purlog-45f7f.cloudfunctions.net/api/session_tokens/refresh";
      const body = {
        projectJWT,
        sessionJWT,
        projectId
      };
  
      try {
        const response = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        });
  
        if (response.status !== 200) {
          this.isRefreshing = false;
          throw PurLogError.error("Failed to refresh session JWT", "Non-200 status code.");
        }
  
        const data = await response.json();
        const newJwt = data.jwt;
  
        if (!newJwt) {
          this.isRefreshing = false;
          throw PurLogError.error("Failed to refresh session JWT", "Failed to parse the response.");
        }
  
        await SecureStorageWrapper.instance.save(newJwt, "PurLogSessionJWT");
        SdkLogger.instance.log(PurLogLevel.INFO, "Session JWT refreshed!");
        this.isRefreshing = false;
        return newJwt;
      } catch (error: any) {
        this.isRefreshing = false;
        throw PurLogError.error("Failed to refresh session JWT", error.message || "Unknown error");
      }
    }
  }