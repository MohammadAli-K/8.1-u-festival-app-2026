/**
 * Named festival acts — descriptions, media, images.
 * Generic slots (talent/DJ/club) use i18n title keys in schedule.js only.
 */

/** @typedef {{ en: string; nl: string }} Bilingual */

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   youtubeUrl: string;
 *   imageSrc: string;
 *   description: Bilingual;
 * }} ActDefinition
 */

import arminImg from '../assets/acts/armin-van-buuren.webp';
import martinImg from '../assets/acts/martin-garrix.webp';
import kensingtonImg from '../assets/acts/kensington.webp';
import withinImg from '../assets/acts/within-temptation.webp';
import deStaatImg from '../assets/acts/de-staat.webp';
import chefspecialImg from '../assets/acts/chefspecial.webp';
import navaroneImg from '../assets/acts/navarone.webp';
import dotanImg from '../assets/acts/dotan.webp';
import eefjeImg from '../assets/acts/eefje-de-visser.webp';
import froukjeImg from '../assets/acts/froukje.webp';
import spinvisImg from '../assets/acts/spinvis.webp';

/** @type {Record<string, ActDefinition>} */
export const actsById = {
  'armin-van-buuren': {
    id: 'armin-van-buuren',
    name: 'Armin van Buuren',
    youtubeUrl: 'https://www.youtube.com/watch?v=TxvpctgU_s8',
    imageSrc: arminImg,
    description: {
      en: "Five-time World's No. 1 DJ and trance icon. Euphoric, high-energy sets headlining festivals from Tomorrowland to Ultra.",
      // nl: "Five-time World's No. 1 DJ and trance icon. Euphoric, high-energy sets headlining festivals from Tomorrowland to Ultra.",
      nl: 'Armin van Buuren is een Nederlandse DJ en producer die bekend staat om zijn trance-sets. Hij is vijf keer wereldwijd nummer één en een van de meest invloedrijke figuren in de trance-scene. Zijn euphorische, hoog energieke sets zijn op grote festivals van Tomorrowland tot Ultra populair.',
    },
  },
  'martin-garrix': {
    id: 'martin-garrix',
    name: 'Martin Garrix',
    youtubeUrl: 'https://www.youtube.com/watch?v=Zv1QV6lrc_Y',
    imageSrc: martinImg,
    description: {
      en: 'Broke through as a teenager with "Animals". Anthemic big-room tracks and stadium-sized drops.',
      nl: 'Broke through as a teenager with "Animals". Anthemic big-room tracks and stadium-sized drops.',
    },
  },
  kensington: {
    id: 'kensington',
    name: 'Kensington',
    youtubeUrl: 'https://www.youtube.com/watch?v=IH77eOyV95o',
    imageSrc: kensingtonImg,
    description: {
      en: 'Rotterdam-born indie rock quintet. Soaring choruses and driving guitar riffs. Hits like "Streets" and "Riddles".',
      nl: 'Rotterdam-born indie rock quintet. Soaring choruses and driving guitar riffs. Hits like "Streets" and "Riddles".',
    },
  },
  'within-temptation': {
    id: 'within-temptation',
    name: 'Within Temptation',
    youtubeUrl: 'https://www.youtube.com/watch?v=iQVei5C2N4E',
    imageSrc: withinImg,
    description: {
      en: 'Symphonic metal pioneers fronted by Sharon den Adel. Cinematic soundscapes and operatic vocals.',
      nl: 'Symphonic metal pioneers fronted by Sharon den Adel. Cinematic soundscapes and operatic vocals.',
    },
  },
  'de-staat': {
    id: 'de-staat',
    name: 'De Staat',
    youtubeUrl: 'https://www.youtube.com/watch?v=0ttGgIQpAUc',
    imageSrc: deStaatImg,
    description: {
      en: 'Experimental rock from Nijmegen. Funky grooves with angular guitar work and theatrical stagecraft.',
      nl: 'Experimental rock from Nijmegen. Funky grooves with angular guitar work and theatrical stagecraft.',
    },
  },
  chefspecial: {
    id: 'chefspecial',
    name: "Chef'Special",
    youtubeUrl: 'https://www.youtube.com/watch?v=l3jRIr44lss',
    imageSrc: chefspecialImg,
    description: {
      en: 'Four-piece from Haarlem mixing funk, pop, rock and hip-hop. Upbeat genre-fluid live shows.',
      nl: 'Four-piece from Haarlem mixing funk, pop, rock and hip-hop. Upbeat genre-fluid live shows.',
    },
  },
  navarone: {
    id: 'navarone',
    name: 'Navarone',
    youtubeUrl: 'https://www.youtube.com/watch?v=EvLpaCSnc4k',
    imageSrc: navaroneImg,
    description: {
      en: "Utrecht's hard-hitting rock four-piece. Riff-driven anthems and raw live intensity.",
      nl: "Utrecht's hard-hitting rock four-piece. Riff-driven anthems and raw live intensity.",
    },
  },
  dotan: {
    id: 'dotan',
    name: 'Dotan',
    youtubeUrl: 'https://www.youtube.com/watch?v=FZEuqzW16Nw',
    imageSrc: dotanImg,
    description: {
      en: 'Folk-pop singer-songwriter. Intimate voice and acoustic arrangements on songs like "Home".',
      nl: 'Folk-pop singer-songwriter. Intimate voice and acoustic arrangements on songs like "Home".',
    },
  },
  'eefje-de-visser': {
    id: 'eefje-de-visser',
    name: 'Eefje de Visser',
    youtubeUrl: 'https://www.youtube.com/watch?v=6IlLJNmLDMg',
    imageSrc: eefjeImg,
    description: {
      en: 'Indie-pop with atmospheric, electronic-tinged songs. Hypnotic vocals and lush production.',
      nl: 'Indie-pop with atmospheric, electronic-tinged songs. Hypnotic vocals and lush production.',
    },
  },
  froukje: {
    id: 'froukje',
    name: 'Froukje',
    youtubeUrl: 'https://www.youtube.com/watch?v=g4PlReX9e-E',
    imageSrc: froukjeImg,
    description: {
      en: 'Breakthrough pop singer combining candid lyrics with synth-driven hooks.',
      nl: 'Breakthrough pop singer combining candid lyrics with synth-driven hooks.',
    },
  },
  spinvis: {
    id: 'spinvis',
    name: 'Spinvis',
    youtubeUrl: 'https://www.youtube.com/watch?v=F3ZTrGWSLf4',
    imageSrc: spinvisImg,
    description: {
      en: 'Poetic lo-fi surrealist. Collage-like songs blending spoken-word, lo-fi electronics and wistful pop.',
      nl: 'Poetic lo-fi surrealist. Collage-like songs blending spoken-word, lo-fi electronics and wistful pop.',
    },
  },
};
