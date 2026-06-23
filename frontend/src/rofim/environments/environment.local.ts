import { IEnvironment } from './environment.interface';

const environment: IEnvironment = {
  environment: 'local',
  production: false,
  apiUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000',
  matomo: {
    url: '//matomo.staging.rofimoncloud.com/',
    siteId: '1',
    cookieDomain: '*.staging.rofimoncloud.com',
    domains: ['*.staging.rofimoncloud.com'],
  },
};

export default environment;
