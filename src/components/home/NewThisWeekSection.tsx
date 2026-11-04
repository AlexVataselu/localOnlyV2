"use client";

import { useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { useElementWidth } from "@/hooks/useElementWidth";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useExperiencesQuery } from "@/hooks/useExperiencesQuery";
import ExperienceCard from "@/components/ExperienceCard";
import { Experience } from "@/types/experience";
import { DEFAULT_FILTERS } from "@/types/filters";

const Section = styled.section`
  width: 100%;
  padding: 3rem clamp(24px, 5vw, 80px);
  background: transparent;
`;

const Header = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
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
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
`;

const NavArrowsWrap = styled.div`
  display: inline-flex;
  background: ${({ theme }) => theme.colors.accent};
  border-radius: 10px;
  overflow: hidden;
`;

const NavArrowBtn = styled.button<{ $active?: boolean }>`
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
  }
`;

const ShowAllLink = styled(Link)`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accentText};
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.accentHover};
  }
`;

const SliderWrap = styled.div`
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const Track = styled.div`
  width: 100%;
  overflow: hidden;
`;

const List = styled.div<{ $offset: number }>`
  display: flex;
  gap: 1.5rem;
  transform: translateX(${({ $offset }) => $offset}px);
  transition: transform 0.35s ease;
`;

const CardSlot = styled.div`
  flex: 0 0 380px;
  min-width: 0;

  @media (max-width: 900px) {
    flex: 0 0 300px;
  }
`;

const Loading = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: 2rem;
`;

// Card width + gap for scroll distance
const CARD_STEP = 380 + 24; // CardSlot flex-basis + gap

export default function NewThisWeekSection() {
  const [offset, setOffset] = useState(0);
  const [trackRef, trackWidth] = useElementWidth<HTMLDivElement>(900);
  const { data, isLoading } = useExperiencesQuery(DEFAULT_FILTERS);

  const experiences: Experience[] = (data?.pages?.[0]?.items ?? []).slice(0, 8);
  const containerWidth = trackWidth;
  const totalWidth = experiences.length * CARD_STEP - 24;
  const maxScroll = Math.max(0, totalWidth - containerWidth + 48);

  const canGoLeft = offset < 0;
  const canGoRight = offset > -maxScroll;

  const go = (delta: number) => {
    setOffset((o) => Math.max(-maxScroll, Math.min(0, o + delta)));
  };

  if (isLoading) {
    return (
      <Section>
        <Header>
          <TitleWrap>
            <Title>New this week</Title>
          </TitleWrap>
        </Header>
        <Loading>Loading experiences…</Loading>
      </Section>
    );
  }

  if (experiences.length === 0) {
    return null;
  }

  return (
    <Section>
      <Header>
        <TitleWrap>
          <Title>New this week</Title>
        </TitleWrap>
        <RightGroup>
        <ShowAllLink href="/experiences">Show all</ShowAllLink>

          <NavArrowsWrap>
            <NavArrowBtn
              type="button"
              onClick={() => go(CARD_STEP * 2)}
              disabled={!canGoLeft}
              aria-label="Previous"
              $active={canGoLeft}
            >
              <ChevronLeft size={22} />
            </NavArrowBtn>
            <NavArrowBtn
              type="button"
              onClick={() => go(-CARD_STEP * 2)}
              disabled={!canGoRight}
              aria-label="Next"
              $active={canGoRight}
            >
              <ChevronRight size={22} />
            </NavArrowBtn>
          </NavArrowsWrap>
        </RightGroup>
      </Header>
      <SliderWrap>
        <Track ref={trackRef}>
          <List $offset={offset}>
            {experiences.map((exp) => (
              <CardSlot key={exp.id}>
                <ExperienceCard experience={exp} />
              </CardSlot>
            ))}
          </List>
        </Track>
      </SliderWrap>
    </Section>
  );
}
