/**
 * @typedef {'news' | 'alert' | 'update'} NewsItemType
 */

/**
 * @typedef {{
 *   id: string;
 *   type: NewsItemType;
 *   title: { nl: string; en: string };
 *   body: { nl: string; en: string };
 *   timestamp: string;
 *   isNew: boolean;
 * }} NewsItem
 */

/** @type {NewsItem[]} */
export const newsItems = [
  {
    id: 'golden-glu-entrance',
    type: 'alert',
    title: {
      nl: 'Golden-GLU bezoekers: gebruik de gouden ingang',
      en: 'Golden-GLU visitors: use the golden entrance',
    },
    body: {
      nl: 'Volg de bewegwijzering naar de aparte ingang voor Golden-GLU tickettypes.',
      en: 'Follow signage to the separate entrance for Golden-GLU ticket types.',
    },
    timestamp: '2026-06-03T22:00:00',
    isNew: true,
  },
  {
    id: 'armin-podium',
    type: 'update',
    title: {
      nl: 'Armin van Buuren start om 10:30 op Podium',
      en: 'Armin van Buuren starts at 10:30 on Podium',
    },
    body: {
      nl: 'Laatste wijziging in het tijdschema — controleer vlak voor optreden opnieuw.',
      en: 'Latest change to the timetable — double-check shortly before the set.',
    },
    timestamp: '2026-06-03T21:50:00',
    isNew: true,
  },
  {
    id: 'lockers-entrance',
    type: 'news',
    title: {
      nl: 'Lockers beschikbaar bij de ingang',
      en: 'Lockers available at the entrance',
    },
    body: {
      nl: 'Reserveer of betaal ter plaatse. Pin en contactloos mogelijk.',
      en: 'Book ahead or pay on site. Card and contactless accepted.',
    },
    timestamp: '2026-06-03T14:00:00',
    isNew: true,
  },
  {
    id: 'doors-open',
    type: 'news',
    title: {
      nl: 'Deuren open om 12:00',
      en: 'Doors open at 12:00',
    },
    body: {
      nl: 'Kom op tijd en houd je ticket bij de hand.',
      en: 'Arrive in good time and have your ticket ready.',
    },
    timestamp: '2026-06-03T12:00:00',
    isNew: true,
  },
  {
    id: 'shuttle-running',
    type: 'alert',
    title: {
      nl: 'Shuttlebus richting festival rijdt nu!',
      en: 'Shuttle bus to festival is running now!',
    },
    body: {
      nl: 'De pendeldienst rijdt volgens schema. Check de haltes op het terrein.',
      en: 'The shuttle is running to schedule. Check stops on site.',
    },
    timestamp: '2026-06-03T11:45:00',
    isNew: true,
  },
];
