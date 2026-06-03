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
 *   shortTag: Bilingual;
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
    shortTag: {
      nl: 'trance-icoon',
      en: 'trance icon',
    },
    description: {
      en: 'Five-time "World\'s No. 1 DJ" and trance icon, Armin delivers euphoric, high-energy sets that have headlined festivals from Tomorrowland to Ultra. His uplifting melodies and impeccable mixing keep crowds dancing for hours.',
      nl: 'Vijfvoudig "World\'s No. 1 DJ" en trance-icoon Armin geeft euforische sets vol energie die hoofdacts waren op festivals van Tomorrowland tot Ultra. Zijn opbeurende melodieën en feilloze mixwerk houden het publiek urenlang aan het dansen.',
    },
  },
  'martin-garrix': {
    id: 'martin-garrix',
    name: 'Martin Garrix',
    youtubeUrl: 'https://www.youtube.com/watch?v=Zv1QV6lrc_Y',
    imageSrc: martinImg,
    shortTag: {
      nl: 'EDM-superster',
      en: 'EDM superstar',
    },
    description: {
      en: 'Broke through as a teenager with "Animals", Martin Garrix has become one of the biggest names in EDM. His anthemic big-room tracks and stadium-sized drops make him a festival favorite across Europe.',
      nl: 'Als tiener brak Martin Garrix door met "Animals" en groeide hij uit tot een van de grootste namen in de EDM. Zijn anthemic big-room tracks en stadiongrote drops maken hem een festivalfavoriet door heel Europa.',
    },
  },
  kensington: {
    id: 'kensington',
    name: 'Kensington',
    youtubeUrl: 'https://www.youtube.com/watch?v=IH77eOyV95o',
    imageSrc: kensingtonImg,
    shortTag: {
      nl: 'indie rock-anthems',
      en: 'indie rock anthems',
    },
    description: {
      en: 'Rotterdam-born indie rock quintet known for soaring choruses and driving guitar riffs. Hits like "Streets" and "Riddles" showcase their knack for arena-ready hooks and emotionally charged lyricism.',
      nl: 'Rotterdams indierock-vijftal, bekend om meeslepende refreinen en stuwende gitaarriffs. Hits als "Streets" en "Riddles" laten hun talent voor arenawaardige hooks en emotioneel beladen teksten horen.',
    },
  },
  'within-temptation': {
    id: 'within-temptation',
    name: 'Within Temptation',
    youtubeUrl: 'https://www.youtube.com/watch?v=iQVei5C2N4E',
    imageSrc: withinImg,
    shortTag: {
      nl: 'symfonische metal-pioniers',
      en: 'symphonic metal pioneers',
    },
    description: {
      en: 'Symphonic metal pioneers fronted by Sharon den Adel. Their cinematic soundscapes and operatic vocals (think "Ice Queen", "Mother Earth") translate into dramatic, visually stunning festival performances.',
      nl: 'Symfonische metal-pioniers met Sharon den Adel als frontvrouw. Hun filmische soundscapes en operasterke zang (denk aan "Ice Queen" en "Mother Earth") leveren dramatische, visueel verbluffende festivaloptredens op.',
    },
  },
  'de-staat': {
    id: 'de-staat',
    name: 'De Staat',
    youtubeUrl: 'https://www.youtube.com/watch?v=0ttGgIQpAUc',
    imageSrc: deStaatImg,
    shortTag: {
      nl: 'experimentele rock-vernieuwers',
      en: 'experimental rock innovators',
    },
    description: {
      en: 'Experimental rock outfit from Nijmegen, blending funky grooves with angular guitar work and theatrical stagecraft. Tracks like "Witch Doctor" and "Down Town" highlight their genre-bending approach and infectious energy.',
      nl: 'Experimentele rockband uit Nijmegen die funky grooves combineert met hoekig gitaarwerk en theatraal podiumspel. Nummers als "Witch Doctor" en "Down Town" tonen hun grensverleggende aanpak en aanstekelijke energie.',
    },
  },
  chefspecial: {
    id: 'chefspecial',
    name: "Chef'Special",
    youtubeUrl: 'https://www.youtube.com/watch?v=l3jRIr44lss',
    imageSrc: chefspecialImg,
    shortTag: {
      nl: 'genre-overstijgende funk-pop',
      en: 'genre-blending funk-pop',
    },
    description: {
      en: 'A four-piece from Haarlem mixing funk, pop, rock and hip-hop. Their upbeat, genre-fluid sound on songs like "Amigo" and "In Your Arms" makes for joyous, dance-floor-friendly live shows.',
      nl: 'Een viertal uit Haarlem dat funk, pop, rock en hiphop moeiteloos door elkaar mixt. Hun opgewekte, genre-overstijgende sound op nummers als "Amigo" en "In Your Arms" zorgt voor vrolijke, dansbare liveshows.',
    },
  },
  navarone: {
    id: 'navarone',
    name: 'Navarone',
    youtubeUrl: 'https://www.youtube.com/watch?v=EvLpaCSnc4k',
    imageSrc: navaroneImg,
    shortTag: {
      nl: 'keiharde rockformatie',
      en: 'hard-hitting rock four-piece',
    },
    description: {
      en: "Utrecht's hard-hitting rock four-piece, delivering riff-driven anthems and dynamic vocals. With a live reputation for raw intensity, they're tailor-made for late-night main stages.",
      nl: 'Utrechts keiharde rockviertal met riffrijke anthems en dynamische zang. Live staan ze bekend om hun rauwe intensiteit — perfect voor de hoofdpodia diep in de nacht.',
    },
  },
  dotan: {
    id: 'dotan',
    name: 'Dotan',
    youtubeUrl: 'https://www.youtube.com/watch?v=FZEuqzW16Nw',
    imageSrc: dotanImg,
    shortTag: {
      nl: 'folk-pop singer-songwriter',
      en: 'folk-pop singer-songwriter',
    },
    description: {
      en: 'Folk-pop singer-songwriter whose intimate voice and acoustic arrangements (notably on "Home") have earned him platinum sales and sell-out shows. His heartfelt storytelling connects deeply on festival acoustic stages.',
      nl: 'Folk-pop singer-songwriter wiens intieme stem en akoestische arrangementen (vooral op "Home") hem platina platen en uitverkochte zalen opleverden. Zijn oprechte storytelling komt extra binnen op akoestische festivalpodia.',
    },
  },
  'eefje-de-visser': {
    id: 'eefje-de-visser',
    name: 'Eefje de Visser',
    youtubeUrl: 'https://www.youtube.com/watch?v=6IlLJNmLDMg',
    imageSrc: eefjeImg,
    shortTag: {
      nl: 'sferische indie-pop',
      en: 'atmospheric indie-pop',
    },
    description: {
      en: 'Indie-pop artist crafting atmospheric, electronic-tinged songs. Her hypnotic vocals and lush production (as heard on "Ongeveer") create a dreamlike vibe perfect for twilight festival slots.',
      nl: 'Indie-popartiest die sferische, elektronisch getinte nummers maakt. Haar hypnotiserende zang en weelderige productie (zoals op "Ongeveer") creëren een droomachtige sfeer, perfect voor schemerige festivalplekken.',
    },
  },
  froukje: {
    id: 'froukje',
    name: 'Froukje',
    youtubeUrl: 'https://www.youtube.com/watch?v=g4PlReX9e-E',
    imageSrc: froukjeImg,
    shortTag: {
      nl: 'eerlijke popzangeres',
      en: 'candid pop songwriter',
    },
    description: {
      en: "Breakthrough pop singer Froukje Veenstra combines candid lyrics with catchy, synth-driven hooks. Since her 2021 debut, she's become a voice of her generation—ideal for mid-day festival stages.",
      nl: 'Doorbraakzangeres Froukje Veenstra combineert eerlijke teksten met catchy, door synths gedreven hooks. Sinds haar debuut in 2021 is ze uitgegroeid tot een stem van haar generatie — ideaal voor de festivalpodia overdag.',
    },
  },
  spinvis: {
    id: 'spinvis',
    name: 'Spinvis',
    youtubeUrl: 'https://www.youtube.com/watch?v=F3ZTrGWSLf4',
    imageSrc: spinvisImg,
    shortTag: {
      nl: 'poëtische lo-fi-surrealist',
      en: 'poetic lo-fi surrealist',
    },
    description: {
      en: 'Erik de Jong performs under the moniker Spinvis, crafting poetic, collage-like songs that blend spoken-word snippets, lo-fi electronics and wistful pop. Since his debut album in 2002—recorded in his attic—he\'s become a fixture of Dutch indie, renowned for narratives that feel both intimate and surreal. His live shows turn everyday observations into shared, dreamlike experiences.',
      nl: 'Erik de Jong treedt op onder de naam Spinvis en maakt poëtische, collage-achtige liedjes waarin spoken-word, lo-fi elektronica en weemoedige pop samenkomen. Sinds zijn debuutalbum uit 2002 — opgenomen op zijn zolder — is hij een vaste waarde in de Nederlandse indie, geroemd om vertellingen die zowel intiem als surrealistisch aanvoelen. Zijn liveshows veranderen alledaagse observaties in gedeelde, droomachtige ervaringen.',
    },
  },
};

/**
 * Stable display order for the home-page acts list.
 * Matches the order requested by the content owner.
 * @type {readonly string[]}
 */
export const homeActOrder = [
  'armin-van-buuren',
  'martin-garrix',
  'kensington',
  'within-temptation',
  'de-staat',
  'chefspecial',
  'navarone',
  'dotan',
  'eefje-de-visser',
  'froukje',
  'spinvis',
];
