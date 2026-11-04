import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ExperienceDetailPageClient from "./ExperienceDetailPageClient";

export const dynamic = "force-dynamic";

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host");
  const forwardedHost = headersList.get("x-forwarded-host");
  const protoHeader = headersList.get("x-forwarded-proto");
  const hostname = forwardedHost ?? host;

  if (!hostname) {
    const envHost = process.env.NEXT_PUBLIC_BASE_URL;
    if (envHost) {
      return envHost.replace(/\/$/, "");
    }
    throw new Error("Unable to resolve request host");
  }

  const protocol =
    (protoHeader ? protoHeader.split(",")[0]?.trim() : undefined) ??
    (hostname.startsWith("localhost") || hostname.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${protocol}://${hostname}`;
}

async function getExperience(id: string) {
  if (!id) {
    return null;
  }

  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/experiences/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch experience");
  }

  return res.json();
}

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
        activityTypes: (experience.activityTypes as any) || [],
        timeOfDays: (experience.timeOfDays as any) || [],
        duration: (experience.duration as any) || null,
        specials: (experience.specials as any) || [],
      }}
    />
  );
}

