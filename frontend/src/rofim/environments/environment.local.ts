import { IEnvironment } from './environment.interface';

const environment: IEnvironment = {
  environment: 'local',
  production: false,
  apiUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000',
  i18n: {
    defaultLanguage: 'fr',
    supportedLanguages: ['de', 'en', 'es', 'fr', 'it', 'pt'],
  },
};

export default environment;
