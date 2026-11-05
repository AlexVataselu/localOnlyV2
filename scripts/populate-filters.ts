/**
 * Script to populate existing experiences with filter fields
 * Run: tsx scripts/populate-filters.ts
 */

import {
  PrismaClient,
  type ActivityType,
  type Duration,
  type Special,
  type TimeOfDay,
} from "@prisma/client";

const prisma = new PrismaClient();

const ACTIVITY_TYPE_MAPPING: Record<string, string[]> = {
  wine: ["ART_AND_CULTURE", "FOOD_AND_DRINK"],
  tasting: ["ART_AND_CULTURE", "FOOD_AND_DRINK"],
  surf: ["SPORTS", "NATURE_AND_OUTDOORS"],
  camp: ["SPORTS", "NATURE_AND_OUTDOORS"],
  tour: ["TOURS"],
  walking: ["TOURS", "SIGHTSEEING"],
  food: ["FOOD_AND_DRINK"],
  culture: ["ART_AND_CULTURE"],
  museum: ["ART_AND_CULTURE", "SIGHTSEEING"],
  nightlife: ["ENTERTAINMENT"],
  hiking: ["NATURE_AND_OUTDOORS", "SPORTS"],
  beach: ["NATURE_AND_OUTDOORS"],
  wellness: ["WELLNESS"],
  art: ["ART_AND_CULTURE"],
  sports: ["SPORTS"],
  nature: ["NATURE_AND_OUTDOORS"],
};

const TIME_OF_DAY_MAPPING: Record<string, string[]> = {
  morning: ["MORNING"],
  sunrise: ["MORNING"],
  breakfast: ["MORNING"],
  afternoon: ["AFTERNOON"],
  lunch: ["AFTERNOON"],
  evening: ["EVENING"],
  sunset: ["EVENING"],
  night: ["EVENING"],
  dinner: ["EVENING"],
};

const DURATION_KEYWORDS: Record<string, string> = {
  "1h": "UP_TO_1H",
  "1 h": "UP_TO_1H",
  "2h": "ONE_TO_4H",
  "2 h": "ONE_TO_4H",
  "3h": "ONE_TO_4H",
  "3 h": "ONE_TO_4H",
  "4h": "ONE_TO_4H",
  "4 h": "ONE_TO_4H",
  "half day": "FOUR_H_TO_1_DAY",
  "full day": "FOUR_H_TO_1_DAY",
  "1 day": "FOUR_H_TO_1_DAY",
  "2 days": "ONE_TO_3_DAYS",
  "3 days": "ONE_TO_3_DAYS",
  week: "THREE_PLUS_DAYS",
};

function inferActivityTypes(title: string, description?: string | null): string[] {
  const text = `${title} ${description || ""}`.toLowerCase();
  const types = new Set<string>();

  for (const [keyword, activityTypes] of Object.entries(ACTIVITY_TYPE_MAPPING)) {
    if (text.includes(keyword)) {
      activityTypes.forEach((type) => types.add(type));
    }
  }

  // Default to TOURS if nothing matches
  return Array.from(types).length > 0 ? Array.from(types) : ["TOURS"];
}

function inferTimeOfDay(title: string, description?: string | null): string[] {
  const text = `${title} ${description || ""}`.toLowerCase();
  const times = new Set<string>();

  for (const [keyword, timeOfDays] of Object.entries(TIME_OF_DAY_MAPPING)) {
    if (text.includes(keyword)) {
      timeOfDays.forEach((time) => times.add(time));
    }
  }

  // Default to MORNING and AFTERNOON if nothing matches
  return Array.from(times).length > 0 ? Array.from(times) : ["MORNING", "AFTERNOON"];
}

function inferDuration(description?: string | null): string | null {
  if (!description) return "ONE_TO_4H"; // Default duration

  const text = description.toLowerCase();

  for (const [keyword, duration] of Object.entries(DURATION_KEYWORDS)) {
    if (text.includes(keyword)) {
      return duration;
    }
  }

  return "ONE_TO_4H"; // Default duration
}

function inferSpecials(price: number, rating: number): string[] {
  const specials: string[] = [];

  // High rating = likely to sell out
  if (rating >= 4.8) {
    specials.push("LIKELY_TO_SELL_OUT");
  }

  // Low price = might have deals
  if (price < 50) {
    specials.push("DEALS_AND_DISCOUNTS");
  }

  // High rating and recent = new experience
  if (rating >= 4.7) {
    specials.push("NEW_EXPERIENCE");
  }

  return specials;
}

async function main() {
  console.log("🔄 Populating filter fields for existing experiences...");

  const experiences = await prisma.experience.findMany({
    where: {
      OR: [
        { activityTypes: { isEmpty: true } },
        { timeOfDays: { isEmpty: true } },
        { duration: null },
      ],
    },
  });

  console.log(`Found ${experiences.length} experiences to update`);

  for (const experience of experiences) {
    const activityTypes = inferActivityTypes(experience.title, experience.description);
    const timeOfDays = inferTimeOfDay(experience.title, experience.description);
    const duration = inferDuration(experience.description);
    const specials = inferSpecials(experience.price, experience.rating);

    await prisma.experience.update({
      where: { id: experience.id },
      data: {
        activityTypes: activityTypes as ActivityType[],
        timeOfDays: timeOfDays as TimeOfDay[],
        duration: duration as Duration | null,
        specials: specials as Special[],
      },
    });

    console.log(`✅ Updated: ${experience.title}`);
  }

  console.log("✨ Done populating filter fields!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
