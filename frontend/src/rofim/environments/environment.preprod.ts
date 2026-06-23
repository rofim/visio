import { IEnvironment } from './environment.interface';

const environment: IEnvironment = {
  environment: 'preprod',
  production: true,
  apiUrl: 'https://api.preprod.rofim.doctor',
  wsUrl: 'wss://api.preprod.rofim.doctor',
  matomo: {
    url: '//matomo.preprod.rofim.doctor/',
    siteId: '1',
    cookieDomain: '*.preprod.rofim.doctor',
    domains: ['*.preprod.rofim.doctor'],
  },
};

export default environment;
