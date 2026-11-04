import prisma from "@/lib/prisma";
import {
  mapActivityTypeFromEnum,
  mapTimeOfDayFromEnum,
  mapDurationFromEnum,
  mapSpecialFromEnum,
} from "@/utils/filterMappers";

/**
 * One experience in the shape the UI uses. Shared by GET /api/experiences/[id]
 * and the detail page, so the page reads the database directly instead of
 * fetching its own API through the request's Host header.
 */
export async function getExperienceById(id: string) {
  const experience = await prisma.experience.findUnique({
    where: { id },
    include: { host: { select: { id: true, name: true, image: true } } },
  });
  if (!experience) return null;

  const { host, ...rest } = experience;
  const images = (rest.images?.length ?? 0) > 0 ? rest.images : rest.image ? [rest.image] : [];

  return {
    ...rest,
    images,
    hostName: host?.name ?? null,
    hostImage: host?.image ?? null,
    activityTypes: (rest.activityTypes || []).map(mapActivityTypeFromEnum),
    timeOfDays: (rest.timeOfDays || []).map(mapTimeOfDayFromEnum),
    duration: mapDurationFromEnum(rest.duration),
    specials: (rest.specials || []).map(mapSpecialFromEnum),
  };
}

export type ExperienceDetail = NonNullable<Awaited<ReturnType<typeof getExperienceById>>>;
