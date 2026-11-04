import Link from "next/link";
import PageShell from "@/components/ui/PageShell";

export default function NotFound() {
  return (
    <PageShell title="We couldn't find that page" lead="It may have been removed, or the link is wrong.">
      <Link href="/experiences">Browse experiences</Link>
    </PageShell>
  );
}
