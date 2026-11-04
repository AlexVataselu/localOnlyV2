"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import AuthButton from "@/components/AuthButton";
import UploadExperienceButton from "@/components/UploadExperienceButton";
import HamburgerMenu from "@/components/HamburgerMenu";
import HeaderSearchBar from "@/components/HeaderSearchBar";

const StyledHeader = styled.header`
  position: -webkit-sticky !important;
  position: sticky !important;
  top: 0 !important;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1000;
`;

const HeaderInner = styled.div`
  width: 100%;
  padding: 0 clamp(24px, 5vw, 80px);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 0;

  @media (max-width: 900px) {
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    gap: 0.75rem;
    padding: 1rem 0;
  }
`;

const HeaderBottom = styled.div`
  padding: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
`;

const HeaderCenter = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 480px;
  margin: 0 2rem;

  @media (max-width: 900px) {
    flex: 1 1 100%;
    order: 3;
    max-width: none;
    margin: 0.5rem 0 0;
  }
`;

const LogoLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
`;

const LogoImage = styled(Image)`
  width: 100px;
  height: auto;

  @media (max-width: 480px) {
    width: 80px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 480px) {
    gap: 0.4rem;
  }
`;

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  font-size: 1rem;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.accentText};
  }
`;

const MenuBtn = styled.button`
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
    color: ${({ theme }) => theme.colors.accentText};
    background: ${({ theme }) => theme.colors.surface};
  }
`;

export type AppHeaderProps = {
  title?: string;
  /** Use "p" on pages that already have their own <h1>, so there is only one per page. */
  titleAs?: "h1" | "p";
  centerSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  showBackLink?: boolean;
  backHref?: string;
  backLabel?: string;
};

export default function AppHeader({
  title = "",
  titleAs = "h1",
  centerSlot,
  bottomSlot,
  showBackLink = true,
  backHref = "/",
  backLabel = "← Home",
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <StyledHeader>
        <HeaderInner>
          <HeaderTop>
            <HeaderLeft>
              <LogoLink href="/">
                <LogoImage
                  src="/logo-locals-only.png"
                  alt="Locals Only"
                  width={100}
                  height={42}
                  priority
                />
              </LogoLink>
              {title ? <Title as={titleAs}>{title}</Title> : null}
            </HeaderLeft>
            <HeaderCenter>{centerSlot ?? <HeaderSearchBar />}</HeaderCenter>
            <Actions>
              {showBackLink ? (
                <BackLink href={backHref}>{backLabel}</BackLink>
              ) : null}
              <ThemeToggle />
              <UploadExperienceButton />
              <AuthButton />
              <MenuBtn type="button" onClick={openMenu} aria-label="Open menu">
                <Menu size={22} />
              </MenuBtn>
            </Actions>
          </HeaderTop>
          {bottomSlot ? <HeaderBottom>{bottomSlot}</HeaderBottom> : null}
        </HeaderInner>
      </StyledHeader>
      <HamburgerMenu isOpen={menuOpen} onClose={closeMenu} />
    </>
  );
}
