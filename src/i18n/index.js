import nl from './nl.js';
import en from './en.js';

const catalogs = { nl, en };

/**
 * @param {Record<string, string>} messages
 * @returns {(key: string) => string}
 */
export function createTranslator(messages) {
  return (key) => messages[key] ?? key;
}

/**
 * @param {'nl' | 'en'} language
 * @param {string} key
 */
export function tForLocale(language, key) {
  const messages = catalogs[language] ?? catalogs.nl;
  return messages[key] ?? key;
}

export { nl, en, catalogs };
