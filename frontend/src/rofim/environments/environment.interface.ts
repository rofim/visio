export interface IEnvironment {
  environment: string;
  production: boolean;
  apiUrl: string;
  wsUrl: string;
  matomo: {
    url: string;
    siteId: string;
    cookieDomain: string;
    domains: string[];
  };
}
