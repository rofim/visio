// Configuration Matomo par environnement
const matomoConfig = {
  staging: {
    url: '//matomo.staging.rofimoncloud.com/',
    siteId: '1',
    cookieDomain: '*.staging.rofimoncloud.com',
    domains: ['*.staging.rofimoncloud.com'],
  },
  preprod: {
    url: '//matomo.preprod.rofim.doctor/',
    siteId: '1',
    cookieDomain: '*.preprod.rofim.doctor',
    domains: ['*.preprod.rofim.doctor'],
  },
  prod: {
    url: '//matomo.rofim.doctor/',
    siteId: '1',
    cookieDomain: '*.rofim.doctor',
    domains: ['*.rofim.doctor'],
  },
};

/**
 * Get Environment
 * @returns String - Environment name
 */
function getEnvironment(): 'staging' | 'preprod' | 'prod' {
  const { hostname } = window.location;
  if (hostname.includes('staging.rofimoncloud.com')) return 'staging';
  if (hostname.includes('preprod.rofim.doctor')) return 'preprod';
  if (hostname.includes('rofim.doctor') && !hostname.includes('preprod')) return 'prod';
  return 'staging';
}

/**
 * Init Matomo
 */
export default function initMatomo(): void {
  const env = getEnvironment();
  const config = matomoConfig[env];
  if (!config) return;

  const _paq = (window as any)._paq = (window as any)._paq || [];

  // Configuration cross-domain
  _paq.push(['setCookieDomain', config.cookieDomain]);
  _paq.push(['setDomains', config.domains]);
  _paq.push(['setCrossDomainLinkingTimeout', 30]);

  const u = config.url;
  _paq.push(['setTrackerUrl', u + 'matomo.php']);
  _paq.push(['setSiteId', config.siteId]);
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  const d = document;
  const g = d.createElement('script');
  const s = d.getElementsByTagName('script')[0];
  g.async = true;
  g.src = u + 'matomo.js';
  s.parentNode?.insertBefore(g, s);
}
