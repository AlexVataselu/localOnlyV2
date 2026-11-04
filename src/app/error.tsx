"use client";

import PageShell from "@/components/ui/PageShell";
import { ErrorState } from "@/components/ui/Status";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageShell title="Something went wrong">
      <ErrorState
        title="This page didn't load"
        message="It's on our side, not yours. Try again, or come back in a few minutes."
        onRetry={reset}
      />
    </PageShell>
  );
}
