"use client";

import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import { Facebook, Instagram, Linkedin } from "lucide-react";

/* Consistent spacing scale (8px base): 0.5rem=8px, 1rem=16px, 1.5rem=24px, 2rem=32px, 3rem=48px */
const FOOTER_PADDING_X = "clamp(24px, 5vw, 80px)";
/* Logo size (width/height) */
const LOGO_SIZE = 160;
/* Crop from top of logo so it aligns with first line of text (adjust if needed) */
const LOGO_CROP_TOP = 6;
/* Crop from bottom to reduce gap above copyright (adjust if needed) */
const LOGO_CROP_BOTTOM = 45;
const LOGO_VISIBLE_HEIGHT = LOGO_SIZE - LOGO_CROP_BOTTOM;

const Footer = styled.footer`
  width: 100%;
  margin-top: auto;
  flex: none;
  flex-grow: 0;
  z-index: 6;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
`;

const FooterMain = styled.div`
  width: 100%;
  padding: 1.5rem ${FOOTER_PADDING_X} 1rem;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 3rem;
  box-sizing: border-box;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem ${FOOTER_PADDING_X} 1rem;
    gap: 2rem;
  }
`;

const LogoBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  flex-shrink: 0;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
  }
`;

const FooterLogoLink = styled(Link)`
  display: block;
  flex-shrink: 0;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
  }
`;

const LogoImageCrop = styled.div`
  width: ${LOGO_SIZE}px;
  height: ${LOGO_VISIBLE_HEIGHT}px;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  line-height: 0;
`;

const FooterLogo = styled(Image)`
  width: ${LOGO_SIZE}px;
  height: ${LOGO_SIZE}px;
  object-fit: contain;
  object-position: top center;
  display: block;
  margin-top: -${LOGO_CROP_TOP}px;
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: ${LOGO_VISIBLE_HEIGHT}px;
  min-width: 0;
`;

const Tagline = styled.p`
  margin: 0;
  font-size: 1.0625rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 280px;
`;

const NavMap = styled.nav`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 3rem;
  row-gap: 0;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, auto);
    column-gap: 2rem;
    justify-content: center;
    justify-items: center;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
`;

const NavColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 120px;

  @media (max-width: 600px) {
    min-width: auto;
    align-items: center;
  }
`;

const SectionTitle = styled.span`
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const NavLink = styled(Link)`
  font-size: 0.9375rem;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.accentText};
  }
`;

const SocialSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
  flex-shrink: 0;

  @media (max-width: 900px) {
    align-items: center;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: rgba(255, 255, 255, 0.08);
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.accentText};
    background: rgba(255, 255, 255, 0.12);
  }
`;

const CopyrightBar = styled.div`
  width: 100%;
  padding: 0.5rem ${FOOTER_PADDING_X};
  box-sizing: border-box;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Copyright = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function AppFooter() {
  return (
    <Footer>
      <FooterMain>
        <LogoBlock>
          <FooterLogoLink href="/" aria-label="Locals Only home">
            <LogoImageCrop>
              <FooterLogo
                src="/localsOnlyLogoV4.7Tryangle.png"
                alt=""
                width={LOGO_SIZE}
                height={LOGO_SIZE}
              />
            </LogoImageCrop>
          </FooterLogoLink>
          <BrandText>
            <Tagline>
              Discover unique local experiences and connect with authentic hosts around the world.
            </Tagline>
          </BrandText>
        </LogoBlock>

        <NavMap>
          <NavColumn>
            <SectionTitle>Explore</SectionTitle>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/experiences">Browse Experiences</NavLink>
            <NavLink href="/experiences/new">Host an Experience</NavLink>
          </NavColumn>
          <NavColumn>
            <SectionTitle>Company</SectionTitle>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/team">Team</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </NavColumn>
          <NavColumn>
            <SectionTitle>Legal</SectionTitle>
            <NavLink href="/privacy-policy">Privacy Policy</NavLink>
          </NavColumn>
        </NavMap>

        <SocialSection>
          <SectionTitle>Follow us</SectionTitle>
          <SocialLinks>
            <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={18} strokeWidth={2} />
            </SocialLink>
            <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={18} strokeWidth={2} />
            </SocialLink>
            <SocialLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin size={18} strokeWidth={2} />
            </SocialLink>
          </SocialLinks>
        </SocialSection>
      </FooterMain>

      <CopyrightBar>
        <Copyright>© {new Date().getFullYear()} Locals Only. All rights reserved.</Copyright>
      </CopyrightBar>
    </Footer>
  );
}
