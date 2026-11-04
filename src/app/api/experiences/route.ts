import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { IMAGE_HOSTS, isAllowedImageUrl } from "@/lib/images";
import { extrasFromBody } from "@/lib/experienceExtras";
import type { Prisma } from "@prisma/client";
import {
  mapActivityTypeToEnum,
  mapTimeOfDayToEnum,
  mapDurationToEnum,
  mapSpecialToEnum,
  mapActivityTypeFromEnum,
  mapTimeOfDayFromEnum,
  mapDurationFromEnum,
  mapSpecialFromEnum,
} from "@/utils/filterMappers";
import type { ActivityType, TimeOfDay, Duration, Special } from "@/types/filters";

type ExperienceWithHost = {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  activityTypes: string[];
  timeOfDays: string[];
  duration: string | null;
  specials: string[];
  host: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const pageParam = searchParams.get("page");
  
  // Filter parameters
  const activityTypesParam = searchParams.get("activityTypes");
  const timeOfDaysParam = searchParams.get("timeOfDays");
  const durationParam = searchParams.get("duration");
  const specialsParam = searchParams.get("specials");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");

  const limit = Math.max(1, Math.min(Number(limitParam) || 12, 50));
  const page = Math.max(1, Number(pageParam) || 1);
  const skip = (page - 1) * limit;

  // Build where clause for filters
  const where: Prisma.ExperienceWhereInput = {};

  // Price range filter
  if (minPriceParam !== null || maxPriceParam !== null) {
    const price: Prisma.FloatFilter = {};
    if (minPriceParam !== null) price.gte = Number(minPriceParam);
    if (maxPriceParam !== null) price.lte = Number(maxPriceParam);
    where.price = price;
  }

  // Activity types filter (using hasSome for array contains any)
  if (activityTypesParam) {
    const activityTypes = activityTypesParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => mapActivityTypeToEnum(s as ActivityType))
      .filter(Boolean);
    if (activityTypes.length > 0) where.activityTypes = { hasSome: activityTypes };
  }

  // Time of day filter
  if (timeOfDaysParam) {
    const timeOfDays = timeOfDaysParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => mapTimeOfDayToEnum(s as TimeOfDay))
      .filter(Boolean);
    if (timeOfDays.length > 0) where.timeOfDays = { hasSome: timeOfDays };
  }

  // Duration filter
  if (durationParam && durationParam !== "null") {
    where.duration = mapDurationToEnum(durationParam as Duration);
  }

  // Specials filter
  if (specialsParam) {
    const specials = specialsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => mapSpecialToEnum(s as Special))
      .filter(Boolean);
    if (specials.length > 0) where.specials = { hasSome: specials };
  }

  // Page 1: run count, aggregate, and findMany in parallel. Page > 1: only findMany (client uses pages[0] for totalCount/averagePrice/maxPrice).
  const isFirstPage = page === 1;

  const [totalCount, priceStats, experiences] = await Promise.all([
    isFirstPage ? prisma.experience.count({ where }) : 0,
    isFirstPage
      ? prisma.experience.aggregate({
          where,
          _avg: { price: true },
          _max: { price: true },
        })
      : { _avg: { price: null as number | null }, _max: { price: null as number | null } },
    prisma.experience.findMany({
      where,
      skip,
      take: limit + 1,
      orderBy: { createdAt: "desc" },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    }),
  ]);

  const averagePrice = isFirstPage ? (priceStats._avg.price ?? 0) : 0;
  const maxPrice = isFirstPage ? (priceStats._max.price ?? 1000) : 0;

  const hasMore = experiences.length > limit;
  const limitedExperiences = hasMore ? experiences.slice(0, limit) : experiences;

  const formatted = limitedExperiences.map((experience: ExperienceWithHost) => {
    const { host, ...rest } = experience;
    return {
      ...rest,
      hostName: host?.name ?? null,
      hostImage: host?.image ?? null,
      activityTypes: (rest.activityTypes || []).map(mapActivityTypeFromEnum),
      timeOfDays: (rest.timeOfDays || []).map(mapTimeOfDayFromEnum),
      duration: mapDurationFromEnum(rest.duration),
      specials: (rest.specials || []).map(mapSpecialFromEnum),
    };
  });

  return NextResponse.json({
    items: formatted,
    nextPage: hasMore ? page + 1 : null,
    hasMore,
    totalCount,
    averagePrice,
    maxPrice,
  });
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (session.user.role !== "HOST") {
    return NextResponse.json({ error: "Only hosts can create experiences" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    location,
    price,
    image,
    images: imagesBody,
    description,
    activityTypes,
    timeOfDays,
    duration,
    specials,
  } = body ?? {};

  const imagesArr = Array.isArray(imagesBody) ? (imagesBody as string[]).filter((u): u is string => typeof u === "string" && u.trim().length > 0) : [];
  const coverImage = imagesArr.length > 0 ? imagesArr[0] : (typeof image === "string" ? image.trim() : "");

  if (!title || !location || !price) {
    return NextResponse.json(
      { error: "Missing required fields: title, location, price" },
      { status: 400 },
    );
  }

  if (!coverImage) {
    return NextResponse.json(
      { error: "At least one image is required (image or images[0])" },
      { status: 400 },
    );
  }

  const imagesToStore = imagesArr.length > 0 ? imagesArr : [coverImage];

  // next/image can only render these hosts; anything else would break the listing page.
  if (!imagesToStore.every(isAllowedImageUrl)) {
    return NextResponse.json(
      { error: `Images must be https links from: ${IMAGE_HOSTS.join(", ")}` },
      { status: 400 },
    );
  }

  // Map filter fields if provided
  const mappedActivityTypes = activityTypes
    ? (activityTypes as string[]).map((s) => mapActivityTypeToEnum(s as ActivityType))
    : [];
  const mappedTimeOfDays = timeOfDays
    ? (timeOfDays as string[]).map((s) => mapTimeOfDayToEnum(s as TimeOfDay))
    : [];
  const mappedDuration = duration ? mapDurationToEnum(duration as Duration) : null;
  const mappedSpecials = specials
    ? (specials as string[]).map((s) => mapSpecialToEnum(s as Special))
    : [];

  const { included, ...otherExtras } = extrasFromBody(body ?? {});

  const experience = await prisma.experience.create({
    data: {
      ...otherExtras,
      ...(included ? { included: included as unknown as Prisma.InputJsonValue } : {}),
      title,
      location,
      price: Number(price),
      // New listings start unrated; hosts can't set their own rating.
      rating: 0,
      image: coverImage,
      images: imagesToStore,
      description,
      activityTypes: mappedActivityTypes,
      timeOfDays: mappedTimeOfDays,
      duration: mappedDuration,
      specials: mappedSpecials,
      userId: session.user.id,
    },
  });

  return NextResponse.json(experience, { status: 201 });
}

