import { environment as devEnv } from './environment.local';
import { environment as stagingEnv } from './environment.staging';
import { environment as preprodEnv } from './environment.preprod';
import { environment as prodEnv } from './environment.prod';

const getEnvironment = () => {
  const mode = import.meta.env.MODE;

  switch (mode) {
    case 'staging':
      return stagingEnv;
    case 'preprod':
      return preprodEnv;
    case 'production':
      return prodEnv;
    default:
      return devEnv;
  }
};

export const environment = getEnvironment();
