import type { Stories } from './types';

export enum Language {
  Spanish = 'es-ES',
  English = 'en-US',
  French = 'fr-FR',
}

export const LANGUAGE_CONFIG: { [key in Language]: { name: string; flag: string } } = {
  [Language.Spanish]: { name: 'Español', flag: '🇪🇸' },
  [Language.English]: { name: 'English', flag: '🇬🇧' },
  [Language.French]: { name: 'Français', flag: '🇫🇷' },
};


export const STORIES: Stories = {
  [Language.Spanish]: {
    title: "El Carpintero Amable",
    content: `Había una vez, en un pueblo soleado, un carpintero llamado José. No era un carpintero cualquiera. ¡Podía hablar con los animales! Un día, un pajarito triste le dijo: "Mi nido se cayó de un árbol". José sonrió y con su madera mágica, le construyó la casita para pájaros más bonita. Pronto, todos los animales del bosque acudían a José. Construyó una madriguera acogedora para el conejo y una pequeña balsa para la rana. José era el héroe del bosque, demostrando que un poco de amabilidad y un martillo pueden arreglarlo todo.`
  },
  [Language.English]: {
    title: "The Kind Carpenter",
    content: `Once upon a time, in a sunny village, lived a carpenter named Joseph. He wasn't just any carpenter. He could talk to animals! One day, a sad little bird told him, "My nest fell from a tree." Joseph smiled and with his magic wood, he built the most beautiful birdhouse for it. Soon, all the animals in the forest came to Joseph. He built a cozy burrow for the rabbit and a tiny raft for the frog. Joseph was the hero of the forest, showing that a little kindness and a hammer can fix anything.`
  },
  [Language.French]: {
    title: "Le Gentil Charpentier",
    content: `Il était une fois, dans un village ensoleillé, un charpentier nommé Joseph. Ce n'était pas n'importe quel charpentier. Il pouvait parler aux animaux ! Un jour, un petit oiseau triste lui dit : "Mon nid est tombé d'un arbre." Joseph sourit et avec son bois magique, il lui construisit le plus beau des nichoirs. Bientôt, tous les animaux de la forêt vinrent voir Joseph. Il construisit un terrier douillet pour le lapin et un petit radeau pour la grenouille. Joseph était le héros de la forêt, montrant qu'un peu de gentillesse et un marteau peuvent tout arranger.`
  },
};

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5];

export const VOICES = [
  { id: 'Puck', name: 'Cuentista' },
  { id: 'Kore', name: 'Amiga' },
  { id: 'Zephyr', name: 'Mágico' }
];

export const AVATARS = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐰', '🦁', '🐯'];
