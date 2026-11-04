import type { Metadata } from "next";
import { Suspense } from "react";
import ExperiencesView from "@/components/ExperiencesView";

export const metadata: Metadata = {
  title: "Experiences",
  description: "Browse hikes, bike clinics, cooking classes and more across Romania, hosted by locals.",
};

export default function ExperiencesPage() {
  return (
    <Suspense>
      <ExperiencesView />
    </Suspense>
  );
}
