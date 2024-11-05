import { SessionTokenManager } from "../core/api/sessionTokens";
import { SecureStorageWrapper } from "../core/SecureStorageWrapper";

/** @internal */
export async function refreshTokenIfExpired(projectJWT: string, sessionJWT: string, projectId: string) {
    // Logic to refresh the session token if expired
    const isExpired = false; // Implement expiration check logic here
    if (isExpired) {
      const newSessionJWT = await SessionTokenManager.instance.createToken(projectJWT, sessionJWT, projectId);
      await SecureStorageWrapper.instance.save("PurLogSessionJWT", newSessionJWT);
    }
  }