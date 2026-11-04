import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { IMAGE_HOSTS, isAllowedImageUrl } from "@/lib/images";
import { extrasFromBody } from "@/lib/experienceExtras";
import type { Prisma } from "@prisma/client";
import { getExperienceById } from "@/lib/experiences";
import type { ActivityType, TimeOfDay, Duration, Special } from "@/types/filters";
import {
  mapActivityTypeToEnum,
  mapTimeOfDayToEnum,
  mapDurationToEnum,
  mapSpecialToEnum,
} from "@/utils/filterMappers";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const experience = await getExperienceById(id);
  if (!experience) {
    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
  }
  return NextResponse.json(experience);
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
    image,
    images: imagesBody,
    description,
    activityTypes,
    timeOfDays,
    duration,
    specials,
  } = body ?? {};

  const updateData: Prisma.ExperienceUpdateInput = {
    title,
    location,
    price: price !== undefined ? Number(price) : undefined,
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

  const { included, ...otherExtras } = extrasFromBody(body ?? {});
  Object.assign(updateData, otherExtras);
  if (included) updateData.included = included as unknown as Prisma.InputJsonValue;

  const newImages = [updateData.image, ...((updateData.images as string[] | undefined) ?? [])].filter(
    (u): u is string => typeof u === "string",
  );
  if (!newImages.every(isAllowedImageUrl)) {
    return NextResponse.json(
      { error: `Images must be https links from: ${IMAGE_HOSTS.join(", ")}` },
      { status: 400 },
    );
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

