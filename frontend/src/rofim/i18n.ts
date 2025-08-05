import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resources from './locales';
import environment from './environments';

i18n
  // detect user language: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  .use(initReactI18next)
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: environment.i18n.defaultLanguage ?? 'fr',
    supportedLngs: environment.i18n.supportedLanguages ?? ['fr'],
    resources,
  });

export default i18n;
