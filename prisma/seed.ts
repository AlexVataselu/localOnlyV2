import { PrismaClient, Prisma, Role, ActivityType, TimeOfDay, Duration, Special } from "@prisma/client";

import { seedBookingData } from "./bookingSeed";

const prisma = new PrismaClient();

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&h=800&fit=crop`;

// Unsplash photo IDs already used by the app (images.unsplash.com is the only allowed remote host).
const W = {
  hiking: "1464822759023-fed622ff2c3b",
  kayak: "1506905925346-21bda4d32df4",
  cycling: "1544984243-ec57ea16fe25",
  climbing: "1601224748193-d24f166b5c77",
  safari: "1516426122078-c23e76319801",
  wine: "1510812431401-41d2bd2722f3",
  food: "1555939594-58d7cb561ad1",
  tea: "1544787219-7f47ccb76574",
  pasta: "1621996346565-e3dbc646d9a9",
  yoga: "1601925260368-ae2f83cf8b7f",
  meditation: "1506126613408-eca07ce68773",
  spa: "1540555700478-4be289fbecef",
  streetart: "1513364776144-60967b0f800f",
  jazz: "1493225457124-a3eb161ffa5f",
  balloon: "1507608616759-54f48f0af0ee",
};
type Photo = keyof typeof W;

/**
 * The local guides from the home page, as host accounts. Demo data only: these
 * accounts have no sign-in method, so nobody can log in as them.
 */
const GUIDES = [
  { key: "bear", name: "Mihai Bear", email: "mihai.bear@demo.localsonly.ro", image: "/bear.png",
    bio: "Born in Azuga, I've spent twenty winters on the Bucegi ridges. I guide slow, careful hikes and know where the bears really are (and how to keep a respectful distance)." },
  { key: "fox", name: "Dan Fox", email: "dan.fox@demo.localsonly.ro", image: "/fox.png",
    bio: "Former cook turned food walker. I take small groups through Transylvanian kitchens, cellars and markets, and we eat as we go." },
  { key: "lynx", name: "Alex Puma", email: "alex.puma@demo.localsonly.ro", image: "/lynx.png",
    bio: "Mountain-bike and ski instructor in the Prahova Valley. I like technical trails, early starts and riders who are new to both." },
  { key: "wolf", name: "Andrei Wolf", email: "andrei.wolf@demo.localsonly.ro", image: "/wolf.png",
    bio: "Wildlife tracker in the Piatra Craiului and Făgăraș foothills. I work with local rangers and keep groups small and quiet." },
  { key: "dog", name: "Costi Dog", email: "costi.dog@demo.localsonly.ro", image: "/dog.png",
    bio: "Delta boatman from Sfântu Gheorghe. Pelicans, fishermen's lunches and channels the big boats can't reach." },
] as const;
type GuideKey = (typeof GUIDES)[number]["key"];

interface SeedExperience {
  host: GuideKey;
  title: string;
  location: string;
  price: number;
  photos: Photo[];
  description: string;
  activityTypes: ActivityType[];
  timeOfDays: TimeOfDay[];
  duration: Duration;
  specials: Special[];
  included: { title: string; items: string[] }[];
  toBring: string[];
  guestRequirements: string[];
  cancellationPolicy: string;
  languages: string[];
  whereDescription: string;
  availability: string[];
  reviews: { authorName: string; rating: number; text: string; daysAgo: number }[];
}

const FLEX = "Full refund if you cancel at least 48 hours before the start. After that, the guide may keep 50% to cover costs already paid.";
const STRICT = "Full refund up to 7 days before the start. No refund after that, but you can move your booking to another date once.";

const EXPERIENCES: SeedExperience[] = [
  {
    host: "bear", title: "Bucegi sunrise hike to Babele", location: "Bușteni", price: 220,
    photos: ["hiking", "climbing", "kayak", "safari", "hiking", "meditation"],
    description: "We start in the dark from Bușteni and climb through the beech forest to reach the Babele rock formations as the sun comes up over the Prahova Valley. Steady pace, plenty of breaks, and breakfast on the plateau.",
    activityTypes: ["NATURE_AND_OUTDOORS", "SPORTS"], timeOfDays: ["MORNING"], duration: "FOUR_H_TO_1_DAY",
    specials: ["LIKELY_TO_SELL_OUT", "FREE_CANCELLATION"],
    included: [{ title: "Food", items: ["Plateau breakfast", "Hot tea"] }, { title: "Gear", items: ["Headlamp", "Trekking poles"] }],
    toBring: ["Broken-in hiking boots", "Warm layer and rain jacket", "1.5 l of water"],
    guestRequirements: ["Ages 14 and up", "About 900 m of ascent: regular walkers are fine", "Up to 8 guests"],
    cancellationPolicy: FLEX, languages: ["Romanian", "English"],
    whereDescription: "We meet at the Bușteni cable-car base station and walk up the Jepii Mici trail. The cable car brings us back down.",
    availability: ["Sat, 15 Nov · 05:30–12:30", "Sun, 16 Nov · 05:30–12:30", "Sat, 22 Nov · 05:30–12:30"],
    reviews: [
      { authorName: "Ioana", rating: 5, text: "Worth the 4 a.m. alarm. Mihai kept a pace everyone could follow and the sunrise at Babele was unreal.", daysAgo: 12 },
      { authorName: "Tom", rating: 5, text: "Great guide, lots of stories about the mountain. Breakfast on top was a lovely touch.", daysAgo: 40 },
      { authorName: "Andreea", rating: 4, text: "Hard climb for me but never felt rushed. Bring a warm hat, it's cold before dawn.", daysAgo: 75 },
    ],
  },
  {
    host: "lynx", title: "Azuga forest trails by e-bike", location: "Azuga", price: 280,
    photos: ["cycling", "hiking", "climbing", "kayak", "cycling", "safari"],
    description: "Half a day on the forest roads and singletrack above Azuga, with an e-bike doing the hard part of the climbs. We stop at a shepherd's hut for lunch and come down through the ski slopes.",
    activityTypes: ["SPORTS", "NATURE_AND_OUTDOORS"], timeOfDays: ["MORNING", "AFTERNOON"], duration: "ONE_TO_4H",
    specials: ["NEW_EXPERIENCE"],
    included: [{ title: "Gear", items: ["E-bike", "Helmet", "Gloves"] }, { title: "Food", items: ["Soup", "Sandwich", "Water"] }],
    toBring: ["Sports shoes with grip", "Sunglasses", "Windproof jacket"],
    guestRequirements: ["Ages 12 and up", "You can ride a bike confidently", "Up to 6 guests"],
    cancellationPolicy: FLEX, languages: ["Romanian", "English"],
    whereDescription: "We meet at the Azuga gondola and ride the forest trails above the town, between the Sorica slope and the Cazacu valley.",
    availability: ["Sat, 15 Nov · 09:00–13:00", "Sun, 16 Nov · 09:00–13:00", "Sat, 22 Nov · 14:00–18:00"],
    reviews: [
      { authorName: "Radu", rating: 5, text: "First time on an e-bike, Alex made it easy. The descent through the forest was the highlight.", daysAgo: 8 },
      { authorName: "Sophie", rating: 5, text: "Perfect half-day. Soup at the hut was the best I had in Romania.", daysAgo: 30 },
    ],
  },
  {
    host: "wolf", title: "Tracking wildlife in Piatra Craiului", location: "Zărnești", price: 350,
    photos: ["safari", "hiking", "meditation", "climbing", "safari", "kayak"],
    description: "A quiet afternoon and evening reading tracks, signs and trail-camera footage with a local tracker, ending in a hide at dusk where bears, deer and sometimes wolves come out to feed.",
    activityTypes: ["NATURE_AND_OUTDOORS", "TOURS"], timeOfDays: ["AFTERNOON", "EVENING"], duration: "FOUR_H_TO_1_DAY",
    specials: ["PRIVATE_TOUR", "LIKELY_TO_SELL_OUT"],
    included: [{ title: "Gear", items: ["Binoculars", "Hide access"] }, { title: "Transport", items: ["4x4 transfer from Zărnești"] }, { title: "Drinks", items: ["Hot tea", "Water"] }],
    toBring: ["Dark, quiet clothing", "Warm layers for the hide", "Camera without flash"],
    guestRequirements: ["Ages 10 and up", "You can sit still and silent for 2 hours", "Up to 4 guests"],
    cancellationPolicy: STRICT, languages: ["Romanian", "English", "German"],
    whereDescription: "We meet in Zărnești, drive into the edge of Piatra Craiului National Park and walk the last stretch to the hide.",
    availability: ["Fri, 14 Nov · 15:00–21:00", "Fri, 21 Nov · 15:00–21:00"],
    reviews: [
      { authorName: "Mark", rating: 5, text: "Two bears and a herd of red deer. Andrei knows this forest like his backyard.", daysAgo: 20 },
      { authorName: "Elena", rating: 5, text: "Calm, patient and very respectful of the animals. Unforgettable evening.", daysAgo: 52 },
      { authorName: "Julia", rating: 4, text: "We only saw deer that night, but the tracking walk alone was fascinating.", daysAgo: 90 },
    ],
  },
  {
    host: "fox", title: "Saxon village lunch in Sibiel", location: "Sibiu", price: 190,
    photos: ["food", "tea", "wine", "pasta", "food", "streetart"],
    description: "A slow morning in the hills outside Sibiu: the glass-icon museum in Sibiel, a walk through the orchards, and a long lunch with a local family cooking what's in season.",
    activityTypes: ["FOOD_AND_DRINK", "ART_AND_CULTURE"], timeOfDays: ["MORNING", "AFTERNOON"], duration: "ONE_TO_4H",
    specials: ["FREE_CANCELLATION"],
    included: [{ title: "Food", items: ["Three-course home lunch", "Homemade cozonac"] }, { title: "Drinks", items: ["Local wine", "Elderflower socată"] }, { title: "Tickets", items: ["Glass icon museum"] }],
    toBring: ["Comfortable walking shoes", "An appetite"],
    guestRequirements: ["All ages welcome", "Tell us about allergies when you book", "Up to 10 guests"],
    cancellationPolicy: FLEX, languages: ["Romanian", "English", "French"],
    whereDescription: "We meet at the Sibiel village church, 20 minutes' drive from Sibiu, and walk to the family house.",
    availability: ["Sat, 15 Nov · 10:00–14:00", "Wed, 19 Nov · 10:00–14:00", "Sat, 22 Nov · 10:00–14:00"],
    reviews: [
      { authorName: "Claire", rating: 5, text: "The most generous lunch of our trip. Dan translated every story from our hosts.", daysAgo: 15 },
      { authorName: "Vlad", rating: 4, text: "Lovely village and food. A bit more time in the museum would have been nice.", daysAgo: 60 },
    ],
  },
  {
    host: "fox", title: "Wine cellars of the Târnave plateau", location: "Mediaș", price: 260,
    photos: ["wine", "food", "tea", "wine", "pasta", "food"],
    description: "Three small wineries around Mediaș, from a Saxon cellar under a fortified church to a young winemaker experimenting with Fetească Regală. Tastings with cheese and charcuterie from the valley.",
    activityTypes: ["FOOD_AND_DRINK", "TOURS"], timeOfDays: ["AFTERNOON"], duration: "ONE_TO_4H",
    specials: ["NEW_EXPERIENCE", "DEALS_AND_DISCOUNTS"],
    included: [{ title: "Drinks", items: ["12 wine tastings", "Water"] }, { title: "Food", items: ["Cheese and charcuterie board"] }, { title: "Transport", items: ["Minibus between cellars"] }],
    toBring: ["ID: we check ages", "A designated driver is not needed"],
    guestRequirements: ["Ages 18 and up", "Up to 8 guests"],
    cancellationPolicy: FLEX, languages: ["Romanian", "English"],
    whereDescription: "Pick-up from Mediaș main square, then cellars in the villages of the Târnava Mare valley.",
    availability: ["Sat, 15 Nov · 14:00–18:00", "Sat, 29 Nov · 14:00–18:00"],
    reviews: [
      { authorName: "Paul", rating: 5, text: "Wines I'd never find on my own. The cellar under the church was incredible.", daysAgo: 25 },
    ],
  },
  {
    host: "dog", title: "Danube Delta by rowing boat", location: "Danube Delta", price: 320,
    photos: ["kayak", "safari", "meditation", "kayak", "hiking", "food"],
    description: "Into the narrow channels around Sfântu Gheorghe in a traditional rowing boat, looking for pelicans, herons and cormorants, then a fisherman's lunch of borș and grilled fish on the bank.",
    activityTypes: ["NATURE_AND_OUTDOORS", "SIGHTSEEING", "FOOD_AND_DRINK"], timeOfDays: ["MORNING", "AFTERNOON"], duration: "FOUR_H_TO_1_DAY",
    specials: ["LIKELY_TO_SELL_OUT", "PRIVATE_TOUR"],
    included: [{ title: "Food", items: ["Fish borș", "Grilled fish", "Bread"] }, { title: "Gear", items: ["Life jackets", "Binoculars"] }],
    toBring: ["Sun hat and sunscreen", "Insect repellent", "Light rain jacket"],
    guestRequirements: ["Ages 6 and up", "Children must wear a life jacket", "Up to 5 guests per boat"],
    cancellationPolicy: "Full refund if you cancel 72 hours before. If the weather makes the channels unsafe, we move or refund your booking.",
    languages: ["Romanian", "English", "Russian"],
    whereDescription: "We leave from the pontoon in Sfântu Gheorghe village, where the Danube meets the Black Sea.",
    availability: ["Sat, 15 Nov · 07:00–14:00", "Sun, 16 Nov · 07:00–14:00"],
    reviews: [
      { authorName: "Maria", rating: 5, text: "Hundreds of pelicans and total silence. Costi's fish soup deserves its own review.", daysAgo: 18 },
      { authorName: "Ben", rating: 5, text: "The best day of our trip to Romania, hands down.", daysAgo: 44 },
      { authorName: "Cristina", rating: 5, text: "Small boat, no engine noise, so much wildlife. Book early.", daysAgo: 70 },
    ],
  },
  {
    host: "fox", title: "Cluj street-food and market walk", location: "Cluj-Napoca", price: 150,
    photos: ["food", "streetart", "pasta", "tea", "food", "jazz"],
    description: "An evening across Cluj's old town and the Mihai Viteazul market: langoș, kürtőskalács, mici with mustard and a craft beer to finish, with the city's Hungarian and Romanian stories in between.",
    activityTypes: ["FOOD_AND_DRINK", "TOURS"], timeOfDays: ["EVENING"], duration: "ONE_TO_4H",
    specials: ["DEALS_AND_DISCOUNTS"],
    included: [{ title: "Food", items: ["Six tastings"] }, { title: "Drinks", items: ["Craft beer or lemonade"] }],
    toBring: ["Walking shoes", "Cash for extras"],
    guestRequirements: ["All ages welcome; beer for ages 18+", "Up to 12 guests"],
    cancellationPolicy: FLEX, languages: ["Romanian", "English", "Hungarian"],
    whereDescription: "We meet under the statue in Piața Unirii and finish near the Someș river.",
    availability: ["Thu, 13 Nov · 18:00–21:00", "Fri, 14 Nov · 18:00–21:00", "Thu, 20 Nov · 18:00–21:00"],
    reviews: [
      { authorName: "Anna", rating: 4, text: "Tasty and fun, a great first evening in Cluj.", daysAgo: 10 },
      { authorName: "George", rating: 5, text: "Mici, langoș, beer. What more do you want? Dan is a natural storyteller.", daysAgo: 33 },
    ],
  },
  {
    host: "lynx", title: "First turns: ski lesson in Sinaia", location: "Sinaia", price: 240,
    photos: ["climbing", "hiking", "cycling", "safari", "climbing", "meditation"],
    description: "A gentle two-hour private lesson on the nursery slopes at Cota 1400 for complete beginners or anyone getting back on skis after years away.",
    activityTypes: ["SPORTS"], timeOfDays: ["MORNING", "AFTERNOON"], duration: "ONE_TO_4H",
    specials: ["PRIVATE_TOUR", "FREE_CANCELLATION"],
    included: [{ title: "Lesson", items: ["Two hours, private instructor"] }],
    toBring: ["Ski clothing and gloves", "Your own skis, or rent at the slope (about 80 Lei)"],
    guestRequirements: ["Ages 6 and up", "No experience needed", "Up to 3 guests per instructor"],
    cancellationPolicy: "Full refund up to 24 hours before, or at any time if the slopes are closed.",
    languages: ["Romanian", "English"],
    whereDescription: "We meet at the Cota 1400 gondola station in Sinaia.",
    availability: ["Sat, 20 Dec · 10:00–12:00", "Sun, 21 Dec · 10:00–12:00", "Sat, 27 Dec · 13:00–15:00"],
    reviews: [],
  },
  {
    host: "bear", title: "Herbs and forest walk in the Prahova Valley", location: "Azuga", price: 120,
    photos: ["meditation", "hiking", "tea", "yoga", "spa", "meditation"],
    description: "An easy two-hour walk on the forest edge above Azuga to find and name the plants locals still use: yarrow, St John's wort, wild thyme. We finish with tea brewed from what we picked.",
    activityTypes: ["WELLNESS", "NATURE_AND_OUTDOORS"], timeOfDays: ["MORNING"], duration: "ONE_TO_4H",
    specials: ["NEW_EXPERIENCE"],
    included: [{ title: "Drinks", items: ["Forest tea"] }, { title: "Take home", items: ["Small bag of dried herbs"] }],
    toBring: ["Comfortable shoes", "A small bag"],
    guestRequirements: ["All ages welcome", "Easy terrain", "Up to 10 guests"],
    cancellationPolicy: FLEX, languages: ["Romanian", "English"],
    whereDescription: "We start from the Azuga train station and walk up towards the Sorica forest road.",
    availability: ["Sun, 16 Nov · 10:00–12:00", "Sun, 23 Nov · 10:00–12:00"],
    reviews: [
      { authorName: "Irina", rating: 5, text: "Relaxing and surprisingly informative. The tea at the end was delicious.", daysAgo: 22 },
    ],
  },
  {
    host: "wolf", title: "Two days on the Făgăraș ridge", location: "Făgăraș Mountains", price: 980,
    photos: ["hiking", "climbing", "safari", "kayak", "meditation", "hiking"],
    description: "A demanding two-day traverse on Romania's highest ridge, from Bâlea Lake to Moldoveanu peak, sleeping in a mountain refuge. For fit hikers who want the big views without planning the logistics.",
    activityTypes: ["NATURE_AND_OUTDOORS", "SPORTS"], timeOfDays: ["MORNING", "AFTERNOON"], duration: "ONE_TO_3_DAYS",
    specials: ["LIKELY_TO_SELL_OUT"],
    included: [{ title: "Stay", items: ["One night in a mountain refuge"] }, { title: "Food", items: ["Dinner", "Breakfast", "Trail snacks"] }, { title: "Transport", items: ["Transfer to Bâlea Lake and back"] }],
    toBring: ["Hiking boots", "30–40 l backpack", "Sleeping-bag liner", "Headlamp"],
    guestRequirements: ["Ages 16 and up", "Good fitness: 8–10 hours of walking a day", "Up to 6 guests"],
    cancellationPolicy: STRICT, languages: ["Romanian", "English"],
    whereDescription: "Pick-up from Sibiu or Făgăraș town; the hike starts at Bâlea Lake on the Transfăgărășan road.",
    availability: [],
    reviews: [
      { authorName: "Lukas", rating: 5, text: "Tough but magnificent. Andrei handled the weather and the route perfectly.", daysAgo: 100 },
    ],
  },
];

async function main() {
  await prisma.review.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const hostIds = {} as Record<GuideKey, string>;
  for (const g of GUIDES) {
    const user = await prisma.user.create({
      data: { name: g.name, email: g.email, image: g.image, bio: g.bio, role: Role.HOST },
    });
    hostIds[g.key] = user.id;
  }

  for (const e of EXPERIENCES) {
    const rating = e.reviews.length ? e.reviews.reduce((s, r) => s + r.rating, 0) / e.reviews.length : 0;
    await prisma.experience.create({
      data: {
        title: e.title,
        location: e.location,
        price: e.price,
        rating: Math.round(rating * 10) / 10,
        image: U(W[e.photos[0]]),
        images: e.photos.map((p) => U(W[p])),
        description: e.description,
        userId: hostIds[e.host],
        activityTypes: e.activityTypes,
        timeOfDays: e.timeOfDays,
        duration: e.duration,
        specials: e.specials,
        included: e.included as Prisma.InputJsonValue,
        toBring: e.toBring,
        guestRequirements: e.guestRequirements,
        cancellationPolicy: e.cancellationPolicy,
        languages: e.languages,
        whereDescription: e.whereDescription,
        availability: e.availability,
        reviews: {
          create: e.reviews.map((r) => ({
            authorName: r.authorName,
            rating: r.rating,
            text: r.text,
            createdAt: new Date(Date.now() - r.daysAgo * 86_400_000),
          })),
        },
      },
    });
  }

  console.log(`Seeded ${GUIDES.length} hosts and ${EXPERIENCES.length} experiences.`);

  const extra = await seedBookingData(prisma);
  console.log(`Added ${extra.slots} time slots, ${extra.bookings} bookings and ${extra.reviews} reviews.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
