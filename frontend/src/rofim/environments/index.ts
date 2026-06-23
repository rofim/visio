import devEnv from './environment.local';
import stagingEnv from './environment.staging';
import preprodEnv from './environment.preprod';
import prodEnv from './environment.prod';
import type { IEnvironment } from './environment.interface';

const environments: Record<string, IEnvironment> = {
  staging: stagingEnv,
  preprod: preprodEnv,
  production: prodEnv,
};

export default environments[import.meta.env.MODE] ?? devEnv;
