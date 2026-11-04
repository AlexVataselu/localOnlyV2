"use client";

import AppHeader from "@/components/AppHeader";
import ExperienceForm from "@/components/ExperienceForm";

export default function NewExperiencePageClient() {
  return (
    <>
      <AppHeader
        title="New Experience"
        backHref="/experiences"
        backLabel="← Back to Experiences"
      />
      <ExperienceForm />
    </>
  );
}
