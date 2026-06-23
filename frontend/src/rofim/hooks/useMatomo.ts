import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { isAppInitAtom } from '../atoms/webSocketAtoms';
import { getRofimSession } from '../utils/session';
import environment from '../environments';

function initMatomo(patientId?: string): void {
  const config = environment.matomo;
  if (!config) {
    return;
  }

  window._paq = window._paq || [];
  const paq = window._paq;
  paq.push(['setCookieDomain', config.cookieDomain]);
  paq.push(['setDomains', config.domains]);
  paq.push(['setCrossDomainLinkingTimeout', 30]);

  const u = config.url;
  paq.push(['setTrackerUrl', `${u}matomo.php`]);
  paq.push(['setSiteId', config.siteId]);
  if (patientId) {
    paq.push(['setUserId', patientId]);
  }
  paq.push(['trackPageView']);
  paq.push(['enableLinkTracking']);
  const d = document;
  const g = d.createElement('script');
  const s = d.getElementsByTagName('script')[0];
  g.async = true;
  g.src = `${u}matomo.js`;
  s.parentNode?.insertBefore(g, s);
}

const useMatomo = () => {
  const [isAppInit] = useAtom(isAppInitAtom);

  useEffect(() => {
    if (isAppInit) {
      const rofimSession = getRofimSession();
      initMatomo(rofimSession?.patientId);
    }
  }, [isAppInit]);
};

export default useMatomo;
