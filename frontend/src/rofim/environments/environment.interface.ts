export interface IEnvironment {
  environment: string;
  production: boolean;
  apiUrl: string;
  wsUrl: string;
  i18n: {
    defaultLanguage: string;
    supportedLanguages: string[];
  };
}
