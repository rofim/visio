/* eslint-disable @cspell/spellchecker */
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
  matomo: {
    url: '//matomo.rofim.doctor/',
    siteId: '1',
    cookieDomain: '*.rofim.doctor',
    domains: ['*.rofim.doctor'],
  },
};

export default environment;
