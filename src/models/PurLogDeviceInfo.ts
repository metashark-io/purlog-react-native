import * as Device from 'expo-device';

/** @internal */
export class PurLogDeviceInfo {
    public osName: string;
    public osVersion: string;
  
    constructor() {
      // Determine the OS platform
      this.osName = Device.osName ?? "Unknown OS Device"
  
      // Get the OS version
      this.osVersion = Device.osVersion ?? "Unknown Version";
    }
  
    asDictionary(): Record<string, string> {
      return {
        osName: this.osName,
        osVersion: this.osVersion
      };
    }
  }