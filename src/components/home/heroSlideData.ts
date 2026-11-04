/**
 * Hero slide content and badge challenges per slide.
 * Each slide has unique badge challenges themed to the animal / story.
 */

export interface HeroChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  complete: boolean;
}

export interface HeroSlideData {
  image: string;
  titleMain: string;
  titleSub: string;
  badgeSectionTitle: string;
  challenges: HeroChallenge[];
}

export const HERO_SLIDES: HeroSlideData[] = [
  {
    image: "/bear.png",
    titleMain: "THE BEAR",
    titleSub: "NECESSITIES",
    badgeSectionTitle: "Earn your bear necessities",
    challenges: [
      {
        id: "bear-foraging",
        title: "Foraging",
        description: "Find wild berries and edible plants. Know what the forest offers.",
        icon: "🫐",
        complete: false,
      },
      {
        id: "bear-honey",
        title: "Honey Hunter",
        description: "Discover wild honey and learn to read the bees.",
        icon: "🍯",
        complete: true,
      },
      {
        id: "bear-shelter",
        title: "Shelter Builder",
        description: "Build a safe spot to rest. Leave no trace.",
        icon: "🏕️",
        complete: false,
      },
      {
        id: "bear-cache",
        title: "Cache Master",
        description: "Store supplies for later. Plan ahead like a bear.",
        icon: "📦",
        complete: false,
      },
      {
        id: "bear-fire",
        title: "Fire Starter",
        description: "Start a fire responsibly. Warmth and safety in the wild.",
        icon: "🔥",
        complete: true,
      },
      {
        id: "bear-roots",
        title: "Wild Roots",
        description: "Identify roots and tubers. Ancient survival knowledge.",
        icon: "🥔",
        complete: false,
      },
    ],
  },
  {
    image: "/fox.png",
    titleMain: "THE FOX'S",
    titleSub: "DEN",
    badgeSectionTitle: "Challenges of the den",
    challenges: [
      {
        id: "fox-night",
        title: "Night Explorer",
        description: "Navigate trails after dark. Trust your senses.",
        icon: "🌙",
        complete: true,
      },
      {
        id: "fox-stealth",
        title: "Stealth Trek",
        description: "Move quietly through the woods. Leave only footprints.",
        icon: "🦊",
        complete: false,
      },
      {
        id: "fox-burrow",
        title: "Burrow Finder",
        description: "Discover hidden dens and sheltered spots.",
        icon: "🕳️",
        complete: false,
      },
      {
        id: "fox-dawn",
        title: "Dawn Patrol",
        description: "Start at first light. Catch the morning trail.",
        icon: "🌅",
        complete: true,
      },
      {
        id: "fox-urban",
        title: "Urban Edge",
        description: "Where town meets trail. Find the wild in between.",
        icon: "🏙️",
        complete: false,
      },
      {
        id: "fox-observer",
        title: "Silent Observer",
        description: "Watch wildlife without disturbing. Patience rewards.",
        icon: "👁️",
        complete: false,
      },
    ],
  },
  {
    image: "/lynx.png",
    titleMain: "THE LYNX'S",
    titleSub: "TRAIL",
    badgeSectionTitle: "Master the lynx trail",
    challenges: [
      {
        id: "lynx-snow",
        title: "Snow Tracker",
        description: "Read tracks in snow. Follow the winter path.",
        icon: "❄️",
        complete: true,
      },
      {
        id: "lynx-mountain",
        title: "Mountain Scout",
        description: "Reach high ground. See like the lynx.",
        icon: "⛰️",
        complete: false,
      },
      {
        id: "lynx-ridge",
        title: "Ridge Walker",
        description: "Walk the spine of the hill. Steady and sure.",
        icon: "🏔️",
        complete: false,
      },
      {
        id: "lynx-winter-camp",
        title: "Winter Camp",
        description: "Spend a night in the cold. Prepare and endure.",
        icon: "⛺",
        complete: false,
      },
      {
        id: "lynx-stalker",
        title: "Silent Stalker",
        description: "Move without a sound. Blend with the terrain.",
        icon: "🐾",
        complete: true,
      },
      {
        id: "lynx-peak",
        title: "Peak Seeker",
        description: "Summit a peak. Claim the high view.",
        icon: "🔭",
        complete: false,
      },
    ],
  },
  {
    image: "/wolf.png",
    titleMain: "THE WOLF",
    titleSub: "PACK",
    badgeSectionTitle: "Run with the pack",
    challenges: [
      {
        id: "wolf-pack-hike",
        title: "Pack Hike",
        description: "Lead a group on the trail. Together we go further.",
        icon: "🐺",
        complete: true,
      },
      {
        id: "wolf-howling",
        title: "Howl at Moon",
        description: "Call out under the stars. Find your voice.",
        icon: "🌕",
        complete: false,
      },
      {
        id: "wolf-territory",
        title: "Territory Mark",
        description: "Know your route. Map the pack's domain.",
        icon: "🗺️",
        complete: false,
      },
      {
        id: "wolf-night-run",
        title: "Night Run",
        description: "Cover distance after dark. Trust the pack.",
        icon: "🌃",
        complete: true,
      },
      {
        id: "wolf-alpha",
        title: "Alpha Route",
        description: "Choose the path. Others follow your lead.",
        icon: "👑",
        complete: false,
      },
      {
        id: "wolf-bond",
        title: "Pack Bond",
        description: "Finish a challenge with friends. Strength in numbers.",
        icon: "🤝",
        complete: false,
      },
    ],
  },
  {
    image: "/dog.png",
    titleMain: "THE DOG'S",
    titleSub: "JOURNEY",
    badgeSectionTitle: "The dog's journey badges",
    challenges: [
      {
        id: "dog-trail-buddy",
        title: "Trail Buddy",
        description: "Share the path with a friend. Every step counts.",
        icon: "🐕",
        complete: true,
      },
      {
        id: "dog-fetch",
        title: "Fetch Master",
        description: "Return with something found. Bring it back.",
        icon: "🎾",
        complete: false,
      },
      {
        id: "dog-water",
        title: "Water Break",
        description: "Find a safe spot to drink. Stay hydrated on the trail.",
        icon: "💧",
        complete: true,
      },
      {
        id: "dog-sniff",
        title: "Sniff Explorer",
        description: "Follow your nose. Discover what's off the path.",
        icon: "👃",
        complete: false,
      },
      {
        id: "dog-loyal",
        title: "Loyal Companion",
        description: "Stick together from start to finish. No one left behind.",
        icon: "❤️",
        complete: false,
      },
      {
        id: "dog-journey-end",
        title: "Journey's End",
        description: "Complete a full route. Home again, tail wagging.",
        icon: "🏁",
        complete: false,
      },
    ],
  },
];
