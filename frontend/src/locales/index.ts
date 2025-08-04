import DE from './de.json';
import EN from './en.json';
import ES from './es.json';
import FR from './fr.json';
import IT from './it.json';
import PT from './pt.json';

import ROFIM_DE from './rofim/de.json';
import ROFIM_EN from './rofim/en.json';
import ROFIM_ES from './rofim/es.json';
import ROFIM_FR from './rofim/fr.json';
import ROFIM_IT from './rofim/it.json';
import ROFIM_PT from './rofim/pt.json';

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
