/* eslint-disable no-underscore-dangle */
/* eslint-disable @cspell/spellchecker */
import environment from './environments';

/**
 * Init Matomo
 */
export default function initMatomo(): void {
  const config = environment.matomo;
  if (!config) {
    return;
  }

  window._paq = window._paq || [];
  const paq = window._paq;
  // Configuration cross-domain
  paq.push(['setCookieDomain', config.cookieDomain]);
  paq.push(['setDomains', config.domains]);
  paq.push(['setCrossDomainLinkingTimeout', 30]);

  const u = config.url;
  paq.push(['setTrackerUrl', `${u}matomo.php`]);
  paq.push(['setSiteId', config.siteId]);
  paq.push(['trackPageView']);
  paq.push(['enableLinkTracking']);
  const d = document;
  const g = d.createElement('script');
  const s = d.getElementsByTagName('script')[0];
  g.async = true;
  g.src = `${u}matomo.js`;
  s.parentNode?.insertBefore(g, s);
}
