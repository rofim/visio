import { IEnvironment } from './environment.interface';

const environment: IEnvironment = {
  environment: 'preprod',
  production: true,
  apiUrl: 'https://api.preprod.rofim.doctor',
  wsUrl: 'wss://api.preprod.rofim.doctor',
  i18n: {
    defaultLanguage: 'fr',
    supportedLanguages: ['de', 'en', 'es', 'fr', 'it', 'pt'],
  },
};

export default environment;
