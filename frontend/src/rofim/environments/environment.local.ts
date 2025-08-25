import { IEnvironment } from './environment.interface';

const environment: IEnvironment = {
  i18n: {
    defaultLanguage: 'fr',
    supportedLanguages: ['de', 'en', 'es', 'fr', 'it', 'pt'],
  },
  apiUrl: 'http://localhost:3000',
};

export default environment;
