/** @typedef {{ id: string; avatar: string; user: string; stageKey: string; timeLabel: string }} WallEntry */

const AVATARS = ['🎸', '🥁', '🎤', '✨', '🌟', '💃', '🕺', '🦋', '🎹', '🎧', '🌈', '⚡'];

const USERS = [
  'sam_uu',
  'lotte.fest',
  'dj_mirrors',
  'nina_030',
  'theo_utrecht',
  'floorparty',
  'mees_live',
  'isa.bass',
  'ruben_stage',
  'noor_hangar',
];

const STAGE_KEYS = [
  'interactie.stage.ponton',
  'interactie.stage.theLake',
  'interactie.stage.theClub',
  'interactie.stage.hangar',
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @param {'nl' | 'en'} language
 */
export function createMockWallEntry(language) {
  const locale = language === 'nl' ? 'nl-NL' : 'en-GB';
  const timeLabel = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  return {
    id: `wall-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    avatar: randomItem(AVATARS),
    user: randomItem(USERS),
    stageKey: randomItem(STAGE_KEYS),
    timeLabel,
  };
}

/** @returns {WallEntry[]} */
export function initialWallEntries(language) {
  return Array.from({ length: 8 }, () => createMockWallEntry(language));
}
