import { randomInt } from "crypto";
import { Duration, Special, TimeOfDay, type PrismaClient } from "@prisma/client";
import { romaniaTime } from "../src/lib/slotTime";

/**
 * Demo booking data: time slots for the next DAYS_AHEAD days for every
 * experience, guest bookings on some of them (a few sold out), and extra
 * reviews. Additive and safe to re-run: existing slots are kept, bookings and
 * reviews are only added to experiences that don't have enough yet.
 */
const DAYS_AHEAD = 90;
const MIN_REVIEWS = 5;

/** Small deterministic PRNG, so re-runs produce the same schedule. */
function rng(seedText: string) {
  let h = 2166136261;
  for (const c of seedText) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const START_HOURS: Record<TimeOfDay, number[]> = {
  MORNING: [8, 9, 10],
  AFTERNOON: [14, 15],
  EVENING: [18, 19],
};

/** Length of a slot in hours; multi-day experiences end on a later day. */
const HOURS: Record<Duration, number> = {
  UP_TO_1H: 1,
  ONE_TO_4H: 4,
  FOUR_H_TO_1_DAY: 7,
  ONE_TO_3_DAYS: 32,
  THREE_PLUS_DAYS: 56,
};

const GUEST_NAMES = [
  "Ioana Popescu", "Radu Ionescu", "Sophie Martin", "Lukas Becker", "Elena Dumitru", "Marco Rossi",
  "Ana Georgescu", "James Walker", "Maria Stan", "Tomás García", "Andreea Matei", "Emma Johansson",
  "Vlad Constantin", "Chloé Dubois", "Bogdan Ilie", "Hannah Schmidt", "Cristina Lupu", "Daniel Novak",
];

const REVIEWS = [
  { rating: 5, text: "Exactly what we hoped for: small group, no rush, and a guide who clearly loves the place." },
  { rating: 5, text: "Well organised from the meeting point to the last stop. We learned more in a day than in a week of travel." },
  { rating: 4, text: "Great day out. It ran a little longer than planned, but nobody minded." },
  { rating: 5, text: "Our guide adapted everything to my parents' pace without making it feel slower. Thoughtful and fun." },
  { rating: 5, text: "Booked on a whim and it ended up being the highlight of our trip to Romania." },
  { rating: 4, text: "Lovely experience and very good value. Bring layers, the weather turns quickly." },
  { rating: 5, text: "Felt like being shown around by a friend rather than on a tour. Would book again tomorrow." },
  { rating: 5, text: "Clear instructions beforehand, a great guide on the day, and photos sent the same evening." },
  { rating: 4, text: "Really enjoyed it. The group was the right size and there was time for questions." },
  { rating: 5, text: "Authentic, relaxed and beautifully planned. Our kids still talk about it." },
];

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
/** Same shape as real references ("LO-7K2M9Q"); 32^6 codes, so a clash is negligible for demo volumes. */
const demoReference = () => "LO-" + Array.from({ length: 6 }, () => REF_ALPHABET[randomInt(REF_ALPHABET.length)]).join("");

const slug = (name: string) => name.toLowerCase().normalize("NFD").replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");

export async function seedBookingData(prisma: PrismaClient) {
  const experiences = await prisma.experience.findMany({
    select: {
      id: true,
      title: true,
      price: true,
      timeOfDays: true,
      duration: true,
      specials: true,
      _count: { select: { bookings: true, reviews: true } },
    },
  });

  const today = new Date();
  let slotCount = 0;
  let bookingCount = 0;
  let reviewCount = 0;

  for (const e of experiences) {
    const rand = rng(e.title);
    const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];
    const hours = HOURS[e.duration ?? Duration.ONE_TO_4H];
    const multiDay = hours > 24;
    const times = (e.timeOfDays.length ? e.timeOfDays : [TimeOfDay.MORNING]).flatMap((t) => START_HOURS[t]);
    const isPrivate = e.specials.includes(Special.PRIVATE_TOUR);
    const hasDeals = e.specials.includes(Special.DEALS_AND_DISCOUNTS);
    const popular = e.specials.includes(Special.LIKELY_TO_SELL_OUT);
    // Each experience runs on its own weekdays; weekends always, plus two or three weekdays.
    const weekdays = new Set([6, 0, ...[1, 2, 3, 4, 5].filter(() => rand() < 0.5).slice(0, 3)]);

    const slots: { experienceId: string; startsAt: Date; endsAt: Date; capacity: number; price: number | null }[] = [];
    for (let i = 1; i <= DAYS_AHEAD; i++) {
      const day = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + i));
      const dow = day.getUTCDay();
      // Multi-day trips leave on Saturdays only; others skip the odd week so the calendar has gaps.
      if (multiDay ? dow !== 6 : !weekdays.has(dow) || rand() < 0.15) continue;
      const starts = multiDay ? [times[0]] : times.length > 1 && dow % 6 === 0 ? [times[0], times[times.length - 1]] : [pick(times)];
      for (const hour of [...new Set(starts)]) {
        const startsAt = romaniaTime(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour);
        const weekday = dow >= 1 && dow <= 5;
        slots.push({
          experienceId: e.id,
          startsAt,
          endsAt: new Date(startsAt.getTime() + hours * 3_600_000),
          capacity: isPrivate ? 4 : multiDay ? 8 : 6 + Math.floor(rand() * 7),
          // Weekday discount on listings that advertise deals.
          price: hasDeals && weekday ? Math.round(e.price * 0.85) : null,
        });
      }
    }
    const created = await prisma.timeSlot.createMany({ data: slots, skipDuplicates: true });
    slotCount += created.count;

    // Bookings: only for experiences that have none yet.
    if (e._count.bookings === 0) {
      const saved = await prisma.timeSlot.findMany({ where: { experienceId: e.id }, orderBy: { startsAt: "asc" } });
      for (const [i, slot] of saved.entries()) {
        // Busier soon after today and on popular listings; every eighth early slot sells out.
        const fill = i < 12 && i % 8 === 3 ? 1 : rand() * (popular ? 0.9 : 0.6) * (i < 20 ? 1 : 0.5);
        let left = Math.round(slot.capacity * fill);
        while (left > 0) {
          const guests = Math.min(left, 1 + Math.floor(rand() * 4));
          const name = pick(GUEST_NAMES);
          const unitPrice = slot.price ?? e.price;
          await prisma.booking.create({
            data: {
              reference: demoReference(),
              slotId: slot.id,
              experienceId: e.id,
              guestName: name,
              guestEmail: `${slug(name)}@example.com`,
              guests,
              unitPrice,
              totalPrice: unitPrice * guests,
            },
          });
          bookingCount++;
          left -= guests;
        }
      }
    }

    // Reviews: top up to MIN_REVIEWS and keep Experience.rating as the average.
    if (e._count.reviews < MIN_REVIEWS) {
      const used = new Set<number>();
      const extra = Array.from({ length: MIN_REVIEWS - e._count.reviews }, (_, k) => {
        let idx = Math.floor(rand() * REVIEWS.length);
        while (used.has(idx)) idx = (idx + 1) % REVIEWS.length;
        used.add(idx);
        return {
          experienceId: e.id,
          authorName: pick(GUEST_NAMES).split(" ")[0],
          rating: REVIEWS[idx].rating,
          text: REVIEWS[idx].text,
          createdAt: new Date(today.getTime() - (k + 1) * 9 * 86_400_000),
        };
      });
      await prisma.review.createMany({ data: extra });
      reviewCount += extra.length;
      const agg = await prisma.review.aggregate({ where: { experienceId: e.id }, _avg: { rating: true } });
      await prisma.experience.update({
        where: { id: e.id },
        data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10 },
      });
    }
  }

  return { experiences: experiences.length, slots: slotCount, bookings: bookingCount, reviews: reviewCount };
}
