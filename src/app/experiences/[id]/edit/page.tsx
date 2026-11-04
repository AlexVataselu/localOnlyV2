import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ExperienceForm from "@/components/ExperienceForm";
import PageShell from "@/components/ui/PageShell";
import { api, ApiError } from "@/lib/api/server";
import { auth } from "@/lib/auth";
import type { Experience } from "@/types/experience";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit experience" };

type Props = { params: Promise<{ id: string }> };

export default async function EditExperiencePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/api/auth/signin?callbackUrl=/experiences/${encodeURIComponent(id)}/edit`);

  let experience: Experience;
  try {
    experience = await api<Experience>(`/experiences/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  // Only the owner may edit; the API enforces this too.
  if (experience.host.id !== session.user.id || session.user.role !== "HOST") {
    redirect(`/experiences/${encodeURIComponent(id)}`);
  }

  return (
    <PageShell title="Edit experience" lead={experience.title}>
      <ExperienceForm experience={experience} />
    </PageShell>
  );
}
