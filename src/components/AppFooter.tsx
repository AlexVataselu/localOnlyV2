"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

const Footer = styled.footer`
  margin-top: clamp(2rem, 5vw, 4rem);
  padding: 3rem clamp(16px, 5vw, 80px) 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const Top = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 2rem 3rem;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const Title = styled.h2`
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Text = styled.p`
  margin: 0;
  max-width: 48ch;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Links = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;

  a {
    display: inline-flex;
    align-items: center;
    min-height: 36px;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-decoration: none;
  }
  a:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    text-decoration: underline;
  }
`;

const Bottom = styled.p`
  margin: 2rem 0 0;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function AppFooter() {
  return (
    <Footer>
      <Top>
        <div>
          <Title>Locals Only</Title>
          <Text>Experiences across Romania, hosted by the people who live there.</Text>
        </div>
        <nav aria-label="Footer">
          <Title as="p">Explore</Title>
          <Links>
            <li>
              <Link href="/experiences">Browse experiences</Link>
            </li>
            <li>
              <Link href="/experiences/new">Host an experience</Link>
            </li>
          </Links>
        </nav>
        <Link href="/" aria-label="Locals Only home">
          <Image src="/localsOnlyLogoV4.7Tryangle.png" alt="" width={110} height={110} />
        </Link>
      </Top>
      <Bottom>© {new Date().getFullYear()} Locals Only</Bottom>
    </Footer>
  );
}
