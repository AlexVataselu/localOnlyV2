"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

const Wrap = styled.section`
  padding: 2.5rem clamp(16px, 5vw, 80px);
  background: ${({ theme }) => theme.colors.surface};
  border-block: 1px solid ${({ theme }) => theme.colors.border};
`;

const Inner = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(1.25rem, 4vw, 3rem);

  @media (max-width: 760px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Logo = styled.div`
  position: relative;
  flex-shrink: 0;
  width: clamp(110px, 14vw, 170px);
  aspect-ratio: 180 / 220;
`;

const Copy = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Heading = styled.h2`
  margin: 0;
  font-family: var(--font-display), sans-serif;
  font-weight: 700;
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.textPrimary};

  em {
    display: inline;
    font-style: normal;
    font-weight: 900;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
  }
`;

const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Primary = styled(Link)`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 1.4rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-weight: 800;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }
`;

const Tags = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.6rem;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 760px) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
`;

const Tag = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 1.1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const TAGS = [
  { label: "Outdoors", href: "/experiences?activityTypes=NATURE_AND_OUTDOORS" },
  { label: "Sports", href: "/experiences?activityTypes=SPORTS" },
  { label: "Food & drink", href: "/experiences?activityTypes=FOOD_AND_DRINK" },
];

export default function CTABanner() {
  return (
    <Wrap aria-labelledby="cta-title">
      <Inner>
        <Logo>
          <Image src="/logoSample.png" alt="" fill sizes="170px" style={{ objectFit: "contain" }} />
        </Logo>
        <Copy>
          <Heading id="cta-title">
            Not just an <em>experience,</em>
            <br />
            but the way of <em>local living</em>
          </Heading>
          <Sub>Spend a day the way the people who live there do.</Sub>
          <Primary href="/experiences">Browse all experiences</Primary>
        </Copy>
        <nav aria-label="Popular categories">
          <Tags>
            {TAGS.map((t) => (
              <li key={t.label}>
                <Tag href={t.href}>{t.label}</Tag>
              </li>
            ))}
          </Tags>
        </nav>
      </Inner>
    </Wrap>
  );
}
