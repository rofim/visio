/* eslint-disable @cspell/spellchecker */
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
  matomo: {
    url: '//matomo.preprod.rofim.doctor/',
    siteId: '1',
    cookieDomain: '*.preprod.rofim.doctor',
    domains: ['*.preprod.rofim.doctor'],
  },
};

export default environment;
