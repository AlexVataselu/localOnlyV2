"use client";

import { useRef, useEffect, useState } from "react";
import { Mulish } from "next/font/google";
import styled from "styled-components";

const mulish = Mulish({ subsets: ["latin"], weight: ["700", "900"] });

const Section = styled.section`
  width: 100%;
  padding: clamp(1.5rem, 4vw, 3rem) clamp(24px, 5vw, 80px);
  background: transparent;
`;

const Grid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(313px, 100%), 313px));
  gap: clamp(1.25rem, 3vw, 2rem);
  justify-content: center;
`;

const Card = styled.article`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: clamp(24px, 4vw, 40px);
  gap: clamp(12px, 2vw, 20px);
  margin: 0 auto;
  width: 100%;
  max-width: 313px;
  min-height: 320px;
  height: 390px;
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  border-left: clamp(6px, 1.5vw, 10px) solid ${({ theme }) => theme.colors.accent};
  border-radius: clamp(12px, 2.5vw, 20px);
  flex: none;
  flex-grow: 0;
  /* liquid glass - match ChallengeBadgeCard */
  background: ${({ theme }) => theme.colors.glass};
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);

  @media (max-width: 400px) {
    height: auto;
    min-height: 320px;
  }
`;

const TitleBlock = styled.span`
  display: inline-block;
  max-width: 100%;
  flex: none;
  flex-grow: 0;
`;

const TitleMain = styled.span`
  display: block;
  font-family: "Mulish", sans-serif;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(28px, 5vw, 48px);
  line-height: clamp(34px, 6.25vw, 60px);
  margin: 0;
`;

const TitleSub = styled.span<{ $w?: number }>`
  display: block;
  width: ${({ $w }) => ($w != null && $w > 0 ? `${$w}px` : "100%")};
  max-width: 100%;
  font-family: "Mulish", sans-serif;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(16px, 2.8vw, 32px);
  line-height: clamp(20px, 3.5vw, 40px);
  margin: 0;
`;

const CardText = styled.p`
  margin: 0;
  max-width: 100%;
  font-family: "Mulish", sans-serif;
  font-weight: 900;
  font-size: clamp(14px, 2vw, 24px);
  line-height: clamp(18px, 2.5vw, 30px);
  color: ${({ theme }) => theme.colors.textPrimary};
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;

  @supports not (-webkit-line-clamp: 6) {
    max-height: calc(6 * 1.25em);
    overflow: hidden;
  }
`;

const CARDS = [
  {
    titleMain: "Authentic",
    titleSub: "Experiences",
    text: "Unique accommodations and experiences from Romania, centralized in one place.",
  },
  {
    titleMain: "Trust",
    titleSub: "and Safety",
    text: "All hosts are carefully checked to meet our standards.",
  },
  {
    titleMain: "Great Deals",
    titleSub: "Guarantee",
    text: "Book at the best price with no fees.",
  },
];

function FeatureCard({ titleMain, titleSub, text }: (typeof CARDS)[0]) {
  const mainRef = useRef<HTMLSpanElement>(null);
  const [subWidth, setSubWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onResize = () => setSubWidth(el.offsetWidth);
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [titleMain]);

  return (
    <Card>
      <TitleBlock>
        <TitleMain ref={mainRef}>{titleMain}</TitleMain>
        <TitleSub $w={subWidth}>{titleSub}</TitleSub>
      </TitleBlock>
      <CardText>{text}</CardText>
    </Card>
  );
}

export default function FeatureCards() {
  return (
    <Section className={mulish.className}>
      <Grid>
        {CARDS.map((c) => (
          <FeatureCard key={c.titleMain} {...c} />
        ))}
      </Grid>
    </Section>
  );
}
