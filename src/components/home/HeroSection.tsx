"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Roboto } from "next/font/google";
import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "./heroSlideData";

const roboto = Roboto({ subsets: ["latin"], weight: ["900"] });

/**
 * Split hero: the mascot portrait fills the right of the screen and fades into
 * the topo texture on the left, where the slide's line, the page heading and
 * that mascot's badges live. On mobile the portrait is full bleed and the copy
 * sits in the lower half. The hero is always on a dark photo, so its colours
 * are fixed light-on-dark in both themes.
 */
const DESKTOP = "@media (min-width: 960px)";
const GUTTER = "clamp(16px, 5vw, 80px)";
const INK = "#0f1116";

const Hero = styled.section`
  position: relative;
  min-height: min(100svh, 960px);
  display: flex;
  overflow: hidden;
  color: #fff;
  background: ${INK} url("/topo.jpg") center / cover no-repeat;
  background-blend-mode: soft-light;
`;

/** `focus` keeps each mascot's face in frame; the portraits are square. */
const FOCUS: Record<string, string> = {
  "/bear.png": "40% 18%",
  "/fox.png": "50% 18%",
  "/lynx.png": "50% 15%",
  "/wolf.png": "55% 18%",
  "/dog.png": "50% 15%",
};

const Slide = styled.div<{ $active: boolean }>`
  position: absolute;
  inset: 0 0 auto 0;
  height: min(100svh, 760px);
  opacity: ${({ $active }) => ($active ? 1 : 0)};

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  img {
    object-fit: cover;
  }

  ${DESKTOP} {
    inset: 0 0 0 38%;
    height: auto;
  }
`;

const Shade = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(15, 17, 22, 0.45) 0%,
    rgba(15, 17, 22, 0.05) 22%,
    rgba(15, 17, 22, 0.85) 55%,
    ${INK} 72%
  );

  ${DESKTOP} {
    background:
      linear-gradient(90deg, ${INK} 39%, rgba(15, 17, 22, 0.7) 49%, rgba(15, 17, 22, 0) 68%),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 0.45) 100%);
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  /* Below the mascot's face on mobile. */
  padding: min(52svh, 420px) ${GUTTER} 5.5rem;

  ${DESKTOP} {
    justify-content: center;
    max-width: calc(min(46%, 660px) + ${GUTTER});
    padding: 3.5rem 0 3.5rem ${GUTTER};
  }
`;

/** The mascot line: a brand moment, not the page heading. */
const Display = styled.p`
  margin: 0;
  font-weight: 900;
  font-size: clamp(2.75rem, 7vw, 5.25rem);
  line-height: 0.95;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);

  span {
    display: block;
  }
`;

const Title = styled.h1`
  margin: 1rem 0 0;
  max-width: 30ch;
  font-size: clamp(1.15rem, 2vw, 1.5rem);
  font-weight: 700;
  line-height: 1.35;
  text-wrap: balance;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.25rem;
  margin-top: 1.5rem;
`;

const Primary = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0 1.4rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${INK};
  font-weight: 700;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }
`;

const Secondary = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: #fff;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Badges = styled.section`
  margin-top: 2.5rem;
`;

const BadgesTitle = styled.h2`
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.3;
`;

/* Mobile: one swipeable row. Desktop: a 3 × 2 grid that fits the column. */
const BadgeList = styled.ul`
  list-style: none;
  margin: 0 calc(-1 * ${GUTTER});
  padding: 0.25rem ${GUTTER} 0.5rem;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(210px, 62%);
  gap: 0.75rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: ${GUTTER};
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  ${DESKTOP} {
    margin: 0;
    padding: 0;
    grid-auto-flow: row;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    overflow: visible;
  }
`;

const Badge = styled.li`
  scroll-snap-align: start;
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.6rem;
  row-gap: 0.25rem;
  align-content: start;
  padding: 0.85rem 0.9rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  @media (prefers-reduced-motion: no-preference) {
    transition: border-color 0.2s, background 0.2s, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.accent};
    background: rgba(255, 255, 255, 0.1);
  }
`;

const BadgeIcon = styled.span`
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 10px;
  background: rgba(226, 165, 6, 0.16);
  font-size: 1.2rem;
  line-height: 1;
`;

const BadgeName = styled.h3`
  margin: 0;
  align-self: center;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.25;
`;

const BadgeDesc = styled.p`
  grid-column: 1 / -1;
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.78);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Controls = styled.div`
  position: absolute;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${DESKTOP} {
    left: 69%;
    bottom: 1.5rem;
  }
`;

const ArrowButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.55);
    border-color: #fff;
  }
`;

/** 8px dot, 32px hit area. */
const Dot = styled.button<{ $active: boolean }>`
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  &::after {
    content: "";
    display: block;
    width: ${({ $active }) => ($active ? "22px" : "8px")};
    height: 8px;
    margin: 0 auto;
    border-radius: 999px;
    background: ${({ theme, $active }) => ($active ? theme.colors.accent : "rgba(255, 255, 255, 0.6)")};
    transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
`;

const toTitleCase = (s: string) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const slide = HERO_SLIDES[index];
  const go = (delta: number) => setIndex((i) => (i + delta + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <Hero aria-labelledby="hero-title">
      {HERO_SLIDES.map((s, i) => (
        <Slide key={s.image} $active={i === index} aria-hidden="true">
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            sizes="(min-width: 960px) 62vw, 100vw"
            style={{ objectPosition: FOCUS[s.image] ?? "50% 20%" }}
          />
        </Slide>
      ))}
      <Shade />

      <Content>
        <Display className={roboto.className} aria-live="polite">
          <span>{slide.titleMain}</span>
          <span>{slide.titleSub}</span>
        </Display>
        <Title id="hero-title">
          Outdoor and local experiences across Romania, hosted by the people who live there
        </Title>
        <Actions>
          <Primary href="/experiences">Browse experiences</Primary>
          <Secondary href="/experiences/new">Host an experience</Secondary>
        </Actions>

        <Badges aria-labelledby="hero-badges-title">
          <BadgesTitle id="hero-badges-title">
            {slide.badgeSectionTitle}
          </BadgesTitle>
          {/* Focusable so keyboard users can scroll the row on mobile. */}
          <BadgeList key={slide.image} tabIndex={0} aria-labelledby="hero-badges-title">
            {slide.challenges.map((c) => (
              <Badge key={c.id}>
                <BadgeIcon aria-hidden="true">{c.icon}</BadgeIcon>
                <BadgeName>{c.title}</BadgeName>
                <BadgeDesc>{c.description}</BadgeDesc>
              </Badge>
            ))}
          </BadgeList>
        </Badges>
      </Content>

      <Controls role="group" aria-label="Choose a guide">
        <ArrowButton type="button" onClick={() => go(-1)} aria-label="Previous guide">
          <ChevronLeft size={22} aria-hidden />
        </ArrowButton>
        {HERO_SLIDES.map((s, i) => (
          <Dot
            key={s.image}
            type="button"
            $active={i === index}
            aria-label={`${toTitleCase(s.titleMain)} ${toTitleCase(s.titleSub)}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => setIndex(i)}
          />
        ))}
        <ArrowButton type="button" onClick={() => go(1)} aria-label="Next guide">
          <ChevronRight size={22} aria-hidden />
        </ArrowButton>
      </Controls>
    </Hero>
  );
}
