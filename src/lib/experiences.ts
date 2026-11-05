import prisma from "@/lib/prisma";
import { parseIncluded } from "@/lib/experienceExtras";
import { getUpcomingSlots } from "@/lib/bookings";
import {
  mapActivityTypeFromEnum,
  mapTimeOfDayFromEnum,
  mapDurationFromEnum,
  mapSpecialFromEnum,
} from "@/utils/filterMappers";

/**
 * One experience in the shape the UI uses, including its per-listing details,
 * latest reviews and host profile. Shared by GET /api/experiences/[id] and the
 * detail page, so the page reads the database directly instead of fetching its
 * own API through the request's Host header.
 */
export async function getExperienceById(id: string) {
  const experience = await prisma.experience.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, name: true, image: true, bio: true, createdAt: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { reviews: true } },
    },
  });
  if (!experience) return null;

  const { host, reviews, _count, included, ...rest } = experience;
  // Bookable dates for the booking box; empty until the TimeSlot table exists and has rows.
  const slots = await getUpcomingSlots(experience.id, experience.price).catch(() => []);
  const images = (rest.images?.length ?? 0) > 0 ? rest.images : rest.image ? [rest.image] : [];

  return {
    ...rest,
    images,
    included: parseIncluded(included),
    hostName: host?.name ?? null,
    hostImage: host?.image ?? null,
    hostBio: host?.bio ?? null,
    hostSince: host ? host.createdAt.getFullYear() : null,
    reviewCount: _count.reviews,
    slots,
    reviews: reviews.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      text: r.text,
      createdAt: r.createdAt.toISOString(),
    })),
    activityTypes: (rest.activityTypes || []).map(mapActivityTypeFromEnum),
    timeOfDays: (rest.timeOfDays || []).map(mapTimeOfDayFromEnum),
    duration: mapDurationFromEnum(rest.duration),
    specials: (rest.specials || []).map(mapSpecialFromEnum),
  };
}

export type ExperienceDetail = NonNullable<Awaited<ReturnType<typeof getExperienceById>>>;
