import { IEnvironment } from './environment.interface';

const environment: IEnvironment = {
  environment: 'staging',
  production: false,
  apiUrl: 'https://api.staging.rofimoncloud.com',
  wsUrl: 'wss://api.staging.rofimoncloud.com',
  i18n: {
    defaultLanguage: 'fr',
    supportedLanguages: ['de', 'en', 'es', 'fr', 'it', 'pt'],
  },
};

export default environment;
