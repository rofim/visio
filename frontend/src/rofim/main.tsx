import ReactDOM from 'react-dom/client';
import App from './App.js';
import './i18n.js';
import './css/global.css';

// eslint-disable-next-line @cspell/spellchecker
// Declare for Matomo
declare global {
  interface Window {
    _paq: unknown[];
  }
}

/**
 * The root HTML element where the React application is rendered.
 * This element must exist in the DOM for the application to mount correctly.
 */
const rootElement = document.getElementById('root')!;

/**
 * Initializes and renders the React application into the root element.
 */
ReactDOM.createRoot(rootElement).render(<App />);
