"use client";

import type { ComponentProps } from "react";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import ExperienceDetailContent from "@/components/ExperienceDetailContent";

type Props = ComponentProps<typeof ExperienceDetailContent>;

export default function ExperienceDetailPageClient({ experience }: Props) {
  return (
    <>
      <AppHeader
        backHref="/experiences"
        backLabel="← Back to Experiences"
      />
      <ExperienceDetailContent experience={experience} />
      <AppFooter />
    </>
  );
}
