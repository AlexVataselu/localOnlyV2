import Link from "next/link";
import AppFooter from "@/components/AppFooter";
import AppHeader from "@/components/AppHeader";

export default function NotFound() {
  return (
    <>
      <AppHeader title="Not found" titleAs="p" />
      <main
        id="main"
        style={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "4rem 1.5rem", textAlign: "center" }}
      >
        <h1 style={{ margin: 0 }}>We couldn&apos;t find that page</h1>
        <p style={{ margin: 0 }}>It may have been removed, or the link is wrong.</p>
        <Link href="/experiences" style={{ fontWeight: 700 }}>
          Browse experiences
        </Link>
      </main>
      <AppFooter />
    </>
  );
}
