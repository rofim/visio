import { IEnvironment } from './environment.interface';

const environment: IEnvironment = {
  i18n: {
    defaultLanguage: 'fr',
    supportedLanguages: ['de', 'en', 'es', 'fr', 'it', 'pt'],
  },
  apiUrl: 'https://api.staging.rofimoncloud.com',
};

export default environment;
