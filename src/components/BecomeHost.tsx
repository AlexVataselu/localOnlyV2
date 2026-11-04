"use client";

import Link from "next/link";
import styled from "styled-components";
import { EmptyState } from "@/components/ui/Status";

const BrowseLink = styled(Link)`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accentText};
`;

/** Shown to signed-in people who aren't hosts yet, instead of a silent redirect. */
export default function BecomeHost({ email, contactEmail }: { email: string | null | undefined; contactEmail?: string }) {
  return (
    <EmptyState title="Hosting is invite-only for now">
      <p>
        While we&apos;re getting started, the Locals Only team turns on hosting for each new host personally.
        {contactEmail ? (
          <>
            {" "}
            Email{" "}
            <a href={`mailto:${contactEmail}?subject=${encodeURIComponent("I'd like to host on Locals Only")}`}>{contactEmail}</a>{" "}
            with the experience you&apos;d like to run and the address you signed in with{email ? ` (${email})` : ""}.
          </>
        ) : (
          <> Ask the team to enable hosting for {email ?? "your account"}.</>
        )}
      </p>
      <BrowseLink href="/experiences">Browse experiences in the meantime</BrowseLink>
    </EmptyState>
  );
}
