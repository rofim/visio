import vonageDefaultTheme from './tailwind.config';
import { merge } from 'lodash';

export default merge({}, vonageDefaultTheme, {
  theme: {
    extend: {
      colors: {
        primary: '#1f4793',
        accent: '#2a69e1',
        warn: '#d33134',
        'grey-a': '#8a909b',
        'grey-b': '#757a84',
        'grey-c': '#e7e7e7',
        'grey-d': '#a5abb6',
        'border-line': '#e8e9eb',
        black: '#1e1e1e',
        green: '#1fd576',
        'bright-cyan': '#00aba8',
        yellow: '#efc100',
        white: '#ffffff',
        purple: '#a020f0',
      },
    },
  },
});
