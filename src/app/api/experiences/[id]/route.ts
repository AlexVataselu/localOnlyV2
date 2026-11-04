import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { ActivityType, TimeOfDay, Duration, Special } from "@/types/filters";
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

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experience = await prisma.experience.findUnique({
    where: { id },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!experience) {
    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
  }

  const { host, ...rest } = experience;

  const images =
    (rest.images?.length ?? 0) > 0 ? rest.images : (rest.image ? [rest.image] : []);

  return NextResponse.json({
    ...rest,
    images,
    hostName: host?.name ?? null,
    hostImage: host?.image ?? null,
    activityTypes: (rest.activityTypes || []).map(mapActivityTypeFromEnum),
    timeOfDays: (rest.timeOfDays || []).map(mapTimeOfDayFromEnum),
    duration: mapDurationFromEnum(rest.duration),
    specials: (rest.specials || []).map(mapSpecialFromEnum),
  });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (session.user.role !== "HOST") {
    return NextResponse.json({ error: "Only hosts can update experiences" }, { status: 403 });
  }

  const existing = await prisma.experience.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "You can only update your own experiences" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    location,
    price,
    rating,
    image,
    images: imagesBody,
    description,
    activityTypes,
    timeOfDays,
    duration,
    specials,
  } = body ?? {};

  const updateData: any = {
    title,
    location,
    price: price !== undefined ? Number(price) : undefined,
    rating: rating !== undefined ? Number(rating) : undefined,
    description,
  };

  if (imagesBody !== undefined && Array.isArray(imagesBody)) {
    const imagesArr = (imagesBody as string[]).filter((u): u is string => typeof u === "string" && u.trim().length > 0);
    if (imagesArr.length > 0) {
      updateData.images = imagesArr;
      updateData.image = imagesArr[0];
    }
  } else if (image !== undefined && typeof image === "string" && image.trim()) {
    updateData.image = image.trim();
    updateData.images = [image.trim()];
  }

  if (activityTypes !== undefined) {
    updateData.activityTypes = (activityTypes as string[]).map((s) => mapActivityTypeToEnum(s as ActivityType));
  }
  if (timeOfDays !== undefined) {
    updateData.timeOfDays = (timeOfDays as string[]).map((s) => mapTimeOfDayToEnum(s as TimeOfDay));
  }
  if (duration !== undefined) {
    updateData.duration = duration ? mapDurationToEnum(duration as Duration) : null;
  }
  if (specials !== undefined) {
    updateData.specials = (specials as string[]).map((s) => mapSpecialToEnum(s as Special));
  }

  const updated = await prisma.experience.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (session.user.role !== "HOST") {
    return NextResponse.json({ error: "Only hosts can delete experiences" }, { status: 403 });
  }

  const existing = await prisma.experience.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "You can only delete your own experiences" }, { status: 403 });
  }

  await prisma.experience.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted successfully" });
}

