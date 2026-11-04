"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Roboto } from "next/font/google";
import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChallengeBadgesSlider from "./ChallengeBadgesSlider";
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
  display: flex;
  flex-direction: column;
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
  inset: 0 0 auto 0;
  height: min(100svh, 760px);
  background: linear-gradient(
    to bottom,
    rgba(15, 17, 22, 0.45) 0%,
    rgba(15, 17, 22, 0.05) 25%,
    rgba(15, 17, 22, 0.8) 62%,
    ${INK} 100%
  );

  ${DESKTOP} {
    inset: 0;
    height: auto;
    background:
      linear-gradient(90deg, ${INK} 39%, rgba(15, 17, 22, 0.7) 49%, rgba(15, 17, 22, 0) 68%),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0) 22%, rgba(0, 0, 0, 0) 45%, rgba(15, 17, 22, 0.7) 100%);
  }
`;

/** The copy and the portrait's visible area; the guide controls sit at its foot. */
const Stage = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
`;

const Content = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  /* Below the mascot's face on mobile. */
  padding: min(52svh, 420px) ${GUTTER} 5.5rem;

  ${DESKTOP} {
    justify-content: center;
    min-height: min(62svh, 600px);
    max-width: calc(min(46%, 660px) + ${GUTTER});
    padding: 4rem 0 5.5rem ${GUTTER};
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

/** The approved badge slider, across the bottom of the hero. */
const BadgesWrap = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 0 ${GUTTER} 1rem;
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

      <Stage>
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
      </Stage>

      <BadgesWrap>
        <ChallengeBadgesSlider key={index} challenges={slide.challenges} title={slide.badgeSectionTitle} />
      </BadgesWrap>
    </Hero>
  );
}
