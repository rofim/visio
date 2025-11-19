/* eslint-disable @cspell/spellchecker */
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
  matomo: {
    url: '//matomo.staging.rofimoncloud.com/',
    siteId: '1',
    cookieDomain: '*.staging.rofimoncloud.com',
    domains: ['*.staging.rofimoncloud.com'],
  },
};

export default environment;
