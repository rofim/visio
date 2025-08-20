import { IEnvironment } from './environment.interface';

const environment: IEnvironment = {
  environment: 'production',
  production: true,
  apiUrl: 'https://api.rofim.doctor',
  wsUrl: 'wss://api.rofim.doctor',
  i18n: {
    defaultLanguage: 'fr',
    supportedLanguages: ['de', 'en', 'es', 'fr', 'it', 'pt'],
  },
};

export default environment;
