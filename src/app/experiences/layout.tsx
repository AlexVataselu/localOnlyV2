import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

export const metadata: Metadata = { title: "Experiences" };

// The listing reads useSearchParams(), which production builds require inside a Suspense boundary.
export default function ExperiencesLayout({ children }: { children: ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
