import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import ExperienceDetail from "@/components/ExperienceDetail";
import { api, ApiError } from "@/lib/api/server";
import type { Experience, ExperiencesPage, HostProfile } from "@/types/experience";

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

/** Secondary sections must never take the page down: fall back to empty. */
async function optional<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

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

  const hostId = encodeURIComponent(experience.host.id);
  const similarParams = new URLSearchParams({ limit: "7" });
  if (experience.activityTypes[0]) similarParams.set("activityTypes", experience.activityTypes[0]);

  const [host, fromHost, similar] = await Promise.all([
    optional(() => api<HostProfile>(`/hosts/${hostId}`), null),
    optional(() => api<ExperiencesPage>(`/experiences?hostId=${hostId}&limit=7`).then((p) => p.items), [] as Experience[]),
    optional(() => api<ExperiencesPage>(`/experiences?${similarParams.toString()}`).then((p) => p.items), [] as Experience[]),
  ]);

  const others = fromHost.filter((e) => e.id !== experience.id).slice(0, 6);
  const otherIds = new Set([experience.id, ...others.map((e) => e.id)]);

  return (
    <ExperienceDetail
      experience={experience}
      host={host}
      moreFromHost={others}
      similar={similar.filter((e) => !otherIds.has(e.id)).slice(0, 6)}
    />
  );
}
