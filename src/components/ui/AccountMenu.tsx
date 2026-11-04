"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { signIn, signOut, useSession } from "next-auth/react";
import { LogOut, Plus, User } from "lucide-react";

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

const Pill = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-width: 44px;
  height: 44px;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }

  @media (max-width: 480px) {
    padding: 0 0.85rem;
  }
`;

const Avatar = styled(Pill)`
  padding: 0;
  width: 44px;
`;

const Wrap = styled.div`
  position: relative;
`;

const Menu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  min-width: 240px;
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  box-shadow: ${({ theme }) => theme.shadows.cardHover};
  z-index: 1100;
`;

const Who = styled.div`
  padding: 0.5rem 0.75rem 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 0.25rem;

  strong {
    display: block;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  span {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const itemStyles = `
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  min-height: 44px;
  padding: 0 0.75rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 0.95rem;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
`;

const MenuButton = styled.button`
  ${itemStyles}
  color: ${({ theme }) => theme.colors.textPrimary};
  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const MenuLink = styled(Link)`
  ${itemStyles}
  color: ${({ theme }) => theme.colors.textPrimary};
  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

export default function AccountMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status === "loading") {
    return (
      <Pill type="button" disabled aria-label="Checking sign-in">
        <User size={18} aria-hidden />
      </Pill>
    );
  }

  if (!session?.user) {
    return (
      <Pill type="button" onClick={() => signIn("google")}>
        Sign in
      </Pill>
    );
  }

  const { name, email, role } = session.user;

  return (
    <Wrap ref={wrapRef}>
      <Avatar
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${name ?? email ?? "your account"}`}
        onClick={() => setOpen((v) => !v)}
      >
        {getInitials(name ?? email)}
      </Avatar>
      {open && (
        <Menu id={menuId} role="menu">
          <Who>
            <strong>{name ?? "Signed in"}</strong>
            <span>
              {email}
              {role === "HOST" ? " · Host" : ""}
            </span>
          </Who>
          {role === "HOST" && (
            <MenuLink role="menuitem" href="/experiences/new" onClick={() => setOpen(false)}>
              <Plus size={18} aria-hidden /> Add an experience
            </MenuLink>
          )}
          <MenuButton role="menuitem" type="button" onClick={() => signOut()}>
            <LogOut size={18} aria-hidden /> Sign out
          </MenuButton>
        </Menu>
      )}
    </Wrap>
  );
}
