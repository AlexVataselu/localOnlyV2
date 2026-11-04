"use client";

import { useCallback } from "react";
import styled from "styled-components";
import { signIn, signOut, useSession } from "next-auth/react";

function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return "?";
  const s = name.trim();
  const parts = s.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  // One word: try camelCase (e.g. BlanaTink -> BT)
  const match = s.match(/^([A-Za-z])(?:[a-z]*)([A-Z])/);
  if (match) return (match[1] + match[2]).toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 0.75rem;
  white-space: nowrap;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.2s ease, color 0.2s ease, border 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.cardBackground};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function AuthButton() {
  const { data: session, status } = useSession();

  const handleSignIn = useCallback(() => {
    signIn("google");
  }, []);

  const handleSignOut = useCallback(() => {
    signOut();
  }, []);

  if (status === "loading") {
    return <Button type="button" disabled>...</Button>;
  }

  if (!session?.user) {
    return (
      <Button type="button" onClick={handleSignIn}>
        Sign in
      </Button>
    );
  }

  const initials = getInitials(session.user.name);

  return (
    <Button
      type="button"
      onClick={handleSignOut}
      title={session.user.name ?? "Account"}
      aria-label={`Signed in as ${session.user.name ?? "Account"}. Sign out.`}
    >
      {initials}
    </Button>
  );
}


