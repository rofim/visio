import devEnv from './environment.local';
import stagingEnv from './environment.staging';
import preprodEnv from './environment.preprod';
import prodEnv from './environment.prod';

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

export default getEnvironment();
