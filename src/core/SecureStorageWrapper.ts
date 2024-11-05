import * as SecureStore from 'expo-secure-store';

/** @internal */
export class SecureStorageWrapper {
    private static _instance: SecureStorageWrapper;

  private constructor() {}

  public static get instance(): SecureStorageWrapper {
    if (!SecureStorageWrapper._instance) {
        SecureStorageWrapper._instance = new SecureStorageWrapper();
    }
    return SecureStorageWrapper._instance;
  }

  // Save token
  public async save(value: string, key: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      throw new Error(`PurLog SecureStorageWrapper failed to save key: ${error}`);
    }
  }

  // Retrieve token
  public async get(key: string): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(key);
      if (token === null) {
        throw new Error(`PurLog SecureStorageWrapper failed to get key: Key not found`);
      }
      return token;
    } catch (error) {
      throw new Error(`PurLog SecureStorageWrapper failed to get key: ${error}`);
    }
  }

  // Delete token
  public async delete(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      throw new Error(`PurLog SecureStorageWrapper failed to delete key: ${error}`);
    }
  }

  // Create UUID if it doesn't exist
  public async createUUIDIfNotExists(): Promise<string | null> {
    try {
      const existingUUID = await this.get("PurLogSessionUUID");
      return existingUUID;
    } catch {
      // UUID doesn't exist, create and save it
      const uuid = this.generateUUID();
      await this.save(uuid, "PurLogSessionUUID");
      return uuid;
    }
  }

  // Generate UUID (Simple version)
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}