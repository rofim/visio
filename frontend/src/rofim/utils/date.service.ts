/**
 * Récupère la langue du navigateur avec un fallback
 * @returns string - la langue du navigateur (ex: "fr-FR", "en-US") ou "en-US" par défaut
 */
export function getNavigatorLanguage(): string {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-US';
}

/**
 * Formatte une date ISO en heure courte (sans secondes) selon la langue du navigateur
 * @param dateString - une date ISO (ex: "2025-07-30T07:21:00.000Z")
 * @returns string formatée courte (ex: "17h20" pour fr, "5:20 PM" pour en)
 */
export function getShortTimeStringFromDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const language = getNavigatorLanguage();

  // Format spécial pour le français avec "h" au lieu de ":"
  if (language.startsWith('fr')) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}h${minutes}`;
  }

  // Pour les autres langues, utilise le format natif du navigateur
  return date.toLocaleTimeString(language, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: language.startsWith('en'),
  });
}

/**
 * Formatte une date ISO en date et heure selon la langue du navigateur
 * @param dateString - une date ISO (ex: "2025-07-30T07:21:00.000Z")
 * @returns string formatée avec date et heure
 */
export function getDateTimeStringFromDate(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  const language = getNavigatorLanguage();

  return date.toLocaleString(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: language.startsWith('en'),
  });
}
