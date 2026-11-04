"use client";

import { useState } from "react";
import styled from "styled-components";
import { useElementWidth } from "@/hooks/useElementWidth";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChallengeBadgeCard from "./ChallengeBadgeCard";
import type { HeroChallenge } from "./heroSlideData";

/** Matches HeroSection TitleBlock: same content width as main page title */
const CONTENT_MAX_WIDTH = "min(1400px, 100%)";

const Section = styled.section`
  width: 100%;
  max-width: ${CONTENT_MAX_WIDTH};
  margin: 0 auto;
  padding: 0;
`;

const Header = styled.div`
  width: 100%;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const TitleWrap = styled.div`
  position: relative;
  padding-left: 12px;
  padding-bottom: 8px;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 5px;
    height: 100%;
    background: ${({ theme }) => theme.colors.accent};
    border-top-left-radius: 6px;
  }
  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 6px;
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 700;
  /* Sits on the hero photo in both themes, so it stays light. */
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
`;

const NavArrowsWrap = styled.div`
  display: inline-flex;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.accent};
  border-radius: 10px;
  overflow: hidden;
`;

const NavBtn = styled.button<{ $active?: boolean }>`
  width: 44px;
  height: 44px;
  border: none;
  background: ${({ $active }) => ($active ? "transparent" : "rgba(0, 0, 0, 0.45)")};
  color: #fff;
  cursor: ${({ $active }) => ($active ? "pointer" : "not-allowed")};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, opacity 0.2s;

  &:hover:not(:disabled) {
    background: ${({ $active }) => ($active ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.45)")};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const SliderWrap = styled.div`
  width: 100%;
  position: relative;
  overflow: hidden;
  padding-top: 2.25rem;
  padding-bottom: 2.25rem;
`;

const Track = styled.div`
  width: 100%;
  overflow: hidden;
`;

const List = styled.div<{ $offset: number }>`
  display: flex;
  align-items: stretch;
  gap: 1.5rem;
  transform: translateX(${({ $offset }) => $offset}px);
  transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  margin: 0;
  padding: 0 2px;
`;

const DEFAULT_CHALLENGES: HeroChallenge[] = [
  {
    id: "foraging",
    title: "Foraging",
    description: "Knowledge of the environment, adaptability, and identifying plants and fungi.",
    icon: "🫐",
    complete: false,
  },
  {
    id: "orienteering",
    title: "Orienteering",
    description: "Adaptability, quick decision-making in varying terrain, and resourcefulness.",
    icon: "🧭",
    complete: true,
  },
  {
    id: "trail-running",
    title: "Trail Running",
    description: "Endurance, agility, and comfort on varied and technical terrain.",
    icon: "🏃",
    complete: false,
  },
  {
    id: "bird-watching",
    title: "Bird Watching",
    description: "Patience, attention to detail, and knowledge of local species.",
    icon: "🐦",
    complete: false,
  },
  {
    id: "mountain-biking",
    title: "Mountain Biking",
    description: "Technical skills, balance, and trail awareness.",
    icon: "🚴",
    complete: true,
  },
];

const CARD_WIDTH = 300 + 24; // card width + gap (shows ~2 cards, rest to slide)

export interface ChallengeBadgesSliderProps {
  /** Badge challenges to show. When not provided, uses default set (e.g. standalone use). */
  challenges?: HeroChallenge[];
  /** Section title above the badge slider. */
  title?: string;
}

const DEFAULT_TITLE = "Challenge your friends and earn badges";

export default function ChallengeBadgesSlider({
  challenges = DEFAULT_CHALLENGES,
  title = DEFAULT_TITLE,
}: ChallengeBadgesSliderProps) {
  const [offset, setOffset] = useState(0);
  const [trackRef, trackWidth] = useElementWidth<HTMLDivElement>(1400);

  const maxScroll = Math.max(
    0,
    challenges.length * CARD_WIDTH - (trackWidth) + 48
  );

  const canGoLeft = offset < 0;
  const canGoRight = offset > -maxScroll;

  const go = (delta: number) => {
    setOffset((o) => Math.max(-maxScroll, Math.min(0, o + delta)));
  };

  return (
    <Section>
      <Header>
        <TitleWrap>
          <Title>{title}</Title>
        </TitleWrap>
        <NavArrowsWrap>
          <NavBtn
            type="button"
            onClick={() => go(CARD_WIDTH * 2)}
            disabled={!canGoLeft}
            aria-label="Previous badges"
            $active={canGoLeft}
          >
            <ChevronLeft size={22} />
          </NavBtn>
          <NavBtn
            type="button"
            onClick={() => go(-CARD_WIDTH * 2)}
            disabled={!canGoRight}
            aria-label="Next badges"
            $active={canGoRight}
          >
            <ChevronRight size={22} />
          </NavBtn>
        </NavArrowsWrap>
      </Header>
      <SliderWrap>
        <Track ref={trackRef}>
          <List $offset={offset}>
            {challenges.map((c) => (
              <ChallengeBadgeCard
                key={c.id}
                title={c.title}
                description={c.description}
                icon={c.icon}
                complete={c.complete}
              />
            ))}
          </List>
        </Track>
      </SliderWrap>
    </Section>
  );
}
