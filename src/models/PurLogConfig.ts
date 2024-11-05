import { SecureStorageWrapper } from "../core/SecureStorageWrapper";
import { PurLogEnv } from "../enums/PurLogEnv";
import { PurLogLevel } from "../enums/PurLogLevel";

export class PurLogConfig {
    public level: PurLogLevel;
    public env: PurLogEnv;
    public projectId?: string;
  
    constructor(level: PurLogLevel = PurLogLevel.VERBOSE, env: PurLogEnv = PurLogEnv.DEV, projectId?: string) {
      this.level = level;
      this.env = env;
      this.projectId = projectId;
    }
  
    public static Builder = class {
      private level: PurLogLevel = PurLogLevel.VERBOSE;
      private env: PurLogEnv = PurLogEnv.DEV;
      private projectId?: string;
  
      constructor() {}
  
      public setLevel(level: PurLogLevel): this {
        this.level = level;
        return this;
      }
  
      public setEnv(env: PurLogEnv): this {
        this.env = env;
        return this;
      }
  
      public async setProject(projectId: string, projectJWT: string): Promise<this> {
        try {
          await SecureStorageWrapper.instance.save("PurLogProjectJWT", projectJWT);
          this.projectId = projectId;
        } catch (error) {
          console.error("Failed to save project JWT:", error);
        }
        return this;
      }
  
      public build(): PurLogConfig {
        return new PurLogConfig(this.level, this.env, this.projectId);
      }
    };
  }