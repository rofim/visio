import DE from '../../locales/de.json';
import EN from '../../locales/en.json';
import ES from '../../locales/es.json';
import FR from '../../locales/fr.json';
import IT from '../../locales/it.json';
import PT from '../../locales/pt.json';

import ROFIM_DE from './de.json';
import ROFIM_EN from './en.json';
import ROFIM_ES from './es.json';
import ROFIM_FR from './fr.json';
import ROFIM_IT from './it.json';
import ROFIM_PT from './pt.json';

// Don't load rofim trad for test, to not mess with vonage test suite
export default {
  DE: {
    translation: { ...DE, ...(import.meta.env.MODE !== 'test' && ROFIM_DE) },
  },
  en: {
    translation: { ...EN, ...(import.meta.env.MODE !== 'test' && ROFIM_EN) },
  },
  es: {
    translation: { ...ES, ...(import.meta.env.MODE !== 'test' && ROFIM_ES) },
  },
  fr: {
    translation: { ...FR, ...(import.meta.env.MODE !== 'test' && ROFIM_FR) },
  },
  it: {
    translation: { ...IT, ...(import.meta.env.MODE !== 'test' && ROFIM_IT) },
  },
  pt: {
    translation: { ...PT, ...(import.meta.env.MODE !== 'test' && ROFIM_PT) },
  },
};
