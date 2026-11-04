import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import NewExperiencePageClient from "./NewExperiencePageClient";

export const dynamic = "force-dynamic";

export default async function NewExperiencePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/experiences/new");
  }

  if (session.user.role !== "HOST") {
    redirect("/experiences");
  }

  return <NewExperiencePageClient />;
}


