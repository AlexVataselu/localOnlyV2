"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import styled from "styled-components";
import { X } from "lucide-react";

const Overlay = styled.div<{ $open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.5);
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  transition: opacity 0.25s ease;
`;

const Panel = styled.aside<{ $open: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2001;
  width: min(320px, 85vw);
  background: ${({ theme }) => theme.colors.surface};
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.2);
  padding: 1.5rem 0;
  transform: translateX(${({ $open }) => ($open ? "0" : "100%")});
  transition: transform 0.25s ease;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  border-radius: 8px;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    background: rgba(255, 255, 255, 0.06);
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
`;

const MenuLink = styled(Link)`
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    background: rgba(255, 255, 255, 0.04);
  }
`;

const MENU_ITEMS = [
  { href: "/team", label: "Team" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/experiences", label: "Experiences" },
] as const;

export interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  return (
    <>
      <Overlay $open={isOpen} onClick={onClose} aria-hidden="true" />
      <Panel $open={isOpen} role="dialog" aria-modal="true" aria-label="Menu">
        <Header>
          <Title>Menu</Title>
          <CloseBtn type="button" onClick={onClose} aria-label="Close menu">
            <X size={22} />
          </CloseBtn>
        </Header>
        <Nav>
          {MENU_ITEMS.map(({ href, label }) => (
            <MenuLink key={href} href={href} onClick={onClose}>
              {label}
            </MenuLink>
          ))}
        </Nav>
      </Panel>
    </>
  );
}
