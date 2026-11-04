import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import ExperienceDetail from "@/components/ExperienceDetail";
import { api, ApiError } from "@/lib/api/server";
import type { Experience } from "@/types/experience";

export const dynamic = "force-dynamic";

/** Direct server-to-API call: no self-fetch through request headers. */
const getExperience = cache(async (id: string) => {
  try {
    return await api<Experience>(`/experiences/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const experience = await getExperience((await params).id);
  if (!experience) return { title: "Experience not found" };
  return {
    title: experience.title,
    description: experience.description?.slice(0, 160) ?? `${experience.title} in ${experience.location}`,
    openGraph: { images: [experience.image] },
  };
}

export default async function ExperienceDetailPage({ params }: Props) {
  const experience = await getExperience((await params).id);
  if (!experience) notFound();
  return <ExperienceDetail experience={experience} />;
}
