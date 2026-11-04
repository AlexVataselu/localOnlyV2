"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";
import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AccountMenu from "./AccountMenu";

export const HEADER_HEIGHT = 76;

const SkipLink = styled.a`
  position: absolute;
  left: 1rem;
  top: -100px;
  z-index: 2000;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-weight: 700;

  &:focus {
    top: 0.75rem;
  }
`;

const Bar = styled.header<{ $overlay: boolean }>`
  position: ${({ $overlay }) => ($overlay ? "fixed" : "sticky")};
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${({ theme }) => theme.colors.headerBg};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.glassBorder};
`;

const Row = styled.div`
  min-height: ${HEADER_HEIGHT}px;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem clamp(16px, 5vw, 80px);

  @media (max-width: 900px) {
    flex-wrap: wrap;
  }
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  border-radius: 8px;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: auto;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  color: ${({ theme, $active }) => ($active ? theme.colors.textPrimary : theme.colors.textSecondary)};
  box-shadow: ${({ theme, $active }) => ($active ? `inset 0 -3px 0 ${theme.colors.accent}` : "none")};

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Middle = styled.div`
  flex: 1 1 420px;
  max-width: 560px;
  min-width: 0;

  @media (max-width: 900px) {
    order: 10;
    flex-basis: 100%;
    max-width: none;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`;

const HostLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 44px;
  padding: 0 1rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  @media (max-width: 600px) {
    width: 44px;
    padding: 0;
    justify-content: center;
    span {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
  }
`;

const Below = styled.div`
  padding: 0 clamp(16px, 5vw, 80px);
`;

interface SiteHeaderProps {
  /** Float over the hero (home page) instead of taking space in the flow. */
  overlay?: boolean;
  /** Search or other controls shown in the middle of the bar. */
  middle?: ReactNode;
  /** Extra row under the bar (e.g. filters). */
  below?: ReactNode;
}

export default function SiteHeader({ overlay = false, middle, below }: SiteHeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isHost = session?.user?.role === "HOST";

  return (
    <>
      <SkipLink href="#main">Skip to content</SkipLink>
      <Bar $overlay={overlay}>
        <Row>
          <Brand href="/" aria-label="Locals Only home">
            <Image src="/localsOnlyLogoV4.7Tryangle.png" alt="" width={56} height={56} priority />
          </Brand>
          <Nav aria-label="Main">
            <NavLink href="/experiences" $active={pathname.startsWith("/experiences") && pathname !== "/experiences/new"}>
              Experiences
            </NavLink>
          </Nav>
          {middle && <Middle>{middle}</Middle>}
          <Actions>
            {isHost && (
              <HostLink href="/experiences/new" aria-label="Add an experience">
                <Plus size={18} aria-hidden />
                <span>Add experience</span>
              </HostLink>
            )}
            <ThemeToggle />
            <AccountMenu />
          </Actions>
        </Row>
        {below && <Below>{below}</Below>}
      </Bar>
    </>
  );
}
