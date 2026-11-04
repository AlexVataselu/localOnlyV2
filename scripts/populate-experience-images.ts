/**
 * Backfill `images` for experiences that have `image` but empty `images`.
 * Run: npx tsx scripts/populate-experience-images.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const experiences = await prisma.experience.findMany({
    where: { images: { equals: [] } },
    select: { id: true, image: true, title: true },
  });

  if (experiences.length === 0) {
    console.log("No experiences to update (all already have images).");
    return;
  }

  for (const exp of experiences) {
    // Use the cover image 6 times so the gallery has 6 images until edited
    const images = Array(6).fill(exp.image);
    await prisma.experience.update({
      where: { id: exp.id },
      data: { images },
    });
    console.log(`Updated "${exp.title}" with 6 images.`);
  }

  console.log(`\nDone. Updated ${experiences.length} experience(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
