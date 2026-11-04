import type { Metadata } from "next";
import AppFooter from "@/components/AppFooter";
import AppHeader from "@/components/AppHeader";
import HostLanding from "@/components/HostLanding";
import { auth } from "@/lib/auth";
import NewExperiencePageClient from "./NewExperiencePageClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Host an experience" };

export default async function NewExperiencePage() {
  const session = await auth();

  // Explain hosting instead of bouncing people to the stock sign-in page or back to the listing.
  if (!session?.user || session.user.role !== "HOST") {
    return (
      <>
        <AppHeader title="Host" titleAs="p" backHref="/experiences" backLabel="← Back to Experiences" />
        <HostLanding signedIn={Boolean(session?.user)} email={session?.user?.email} />
        <AppFooter />
      </>
    );
  }

  return <NewExperiencePageClient />;
}
