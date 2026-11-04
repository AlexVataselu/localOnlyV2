import { Suspense, type ReactNode } from "react";

// PREVIEW ONLY: Next.js production builds require a Suspense boundary
// around pages that call useSearchParams().
export default function ExperiencesLayout({ children }: { children: ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
