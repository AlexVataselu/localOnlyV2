import type { Metadata } from "next";
import BecomeHost from "@/components/BecomeHost";
import ExperienceForm from "@/components/ExperienceForm";
import HostLanding from "@/components/HostLanding";
import PageShell from "@/components/ui/PageShell";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Add an experience" };

export default async function NewExperiencePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <PageShell title="Host an experience">
        <HostLanding />
      </PageShell>
    );
  }

  if (session.user.role !== "HOST") {
    return (
      <PageShell title="Host an experience">
        <BecomeHost email={session.user.email} contactEmail={process.env.HOST_CONTACT_EMAIL} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Add an experience" lead="Tell guests what they'll do, where, and what it costs. You can edit it any time.">
      <ExperienceForm />
    </PageShell>
  );
}
