import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getExperienceById } from "@/lib/experiences";
import ExperienceDetailPageClient from "./ExperienceDetailPageClient";

export const dynamic = "force-dynamic";

// Read the database directly (no self-fetch built from request headers).
const getExperience = cache(getExperienceById);

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const experience = await getExperience((await params).id);
  if (!experience) return { title: "Experience not found" };
  return {
    title: experience.title,
    description: experience.description?.slice(0, 160) ?? `${experience.title} in ${experience.location}`,
  };
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { id } = await params;
  const experience = await getExperience(id);

  if (!experience) {
    notFound();
  }

  return (
    <ExperienceDetailPageClient
      experience={{
        id: experience.id,
        title: experience.title,
        location: experience.location,
        price: Number(experience.price),
        rating: Number(experience.rating),
        image: experience.image,
        images: experience.images ?? null,
        description: experience.description ?? "",
        hostName: experience.hostName,
        hostImage: experience.hostImage ?? null,
        activityTypes: experience.activityTypes,
        timeOfDays: experience.timeOfDays,
        duration: experience.duration,
        specials: experience.specials,
      }}
    />
  );
}
