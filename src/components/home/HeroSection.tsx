"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Roboto } from "next/font/google";
import styled from "styled-components";
import ChallengeBadgesSlider from "./ChallengeBadgesSlider";
import { HERO_SLIDES } from "./heroSlideData";

const roboto = Roboto({ subsets: ["latin"], weight: ["900"] });

/**
 * One screen, one guide. The guide's portrait fills the hero with its face in
 * the upper right; the copy holds the left; that guide's badge cards dock in
 * the bottom-right corner, over the portrait, as the next step after the
 * action. The guide picker names each mascot and swaps portrait, line and
 * badges together. The hero is always on a dark photo, so its colours are
 * fixed light-on-dark in both themes.
 */
const DESKTOP = "@media (min-width: 1024px)";
const GUTTER = "clamp(16px, 5vw, 80px)";
const INK = "#0f1116";
/** The sticky site header above the hero. */
const HEADER = 90;

/** Short name for each guide, for the picker. */
const NAMES: Record<string, string> = {
  "/bear.png": "Bear",
  "/fox.png": "Fox",
  "/lynx.png": "Lynx",
  "/wolf.png": "Wolf",
  "/dog.png": "Dog",
};

/** Keeps each mascot's face in frame; the portraits are square. */
const FOCUS: Record<string, string> = {
  "/bear.png": "45% 12%",
  "/fox.png": "50% 12%",
  "/lynx.png": "50% 10%",
  "/wolf.png": "55% 12%",
  "/dog.png": "50% 10%",
};

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  color: #fff;
  background: ${INK} url("/topo.jpg") center / cover no-repeat;
  background-blend-mode: soft-light;

  ${DESKTOP} {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    column-gap: 2rem;
    min-height: max(960px, calc(100svh - ${HEADER}px));
    padding: 0 0 2.5rem ${GUTTER};
  }
`;

const Slide = styled.div<{ $active: boolean }>`
  position: absolute;
  inset: 0 0 auto 0;
  height: 58svh;
  min-height: 360px;
  opacity: ${({ $active }) => ($active ? 1 : 0)};

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }

  img {
    object-fit: cover;
  }

  /* Fade the photo into the topo ground instead of ending on a hard edge. */
  -webkit-mask-image: linear-gradient(to bottom, #000 72%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 72%, transparent 100%);

  ${DESKTOP} {
    inset: 0 0 0 30%;
    height: auto;
    -webkit-mask-image: none;
    mask-image: none;
  }
`;

/** A neutral scrim: dark where text sits, clear over the face. */
const Scrim = styled.div`
  position: absolute;
  inset: 0 0 auto 0;
  height: 58svh;
  min-height: 360px;
  background: linear-gradient(to bottom, rgba(15, 17, 22, 0.35) 0%, rgba(15, 17, 22, 0) 30%, rgba(15, 17, 22, 0.7) 75%, rgba(15, 17, 22, 0) 100%);

  ${DESKTOP} {
    inset: 0;
    height: auto;
    background:
      linear-gradient(90deg, ${INK} 30%, rgba(15, 17, 22, 0.75) 40%, rgba(15, 17, 22, 0) 58%),
      linear-gradient(to bottom, rgba(15, 17, 22, 0) 45%, rgba(15, 17, 22, 0.55) 100%);
  }
`;

const Copy = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  /* Below the face on a phone. */
  padding: calc(58svh - 7rem) ${GUTTER} 0;

  ${DESKTOP} {
    padding: 3rem 0 0;
  }
`;

/** The line, heading and actions, centred in the space above the guide row. */
const Lead = styled.div`
  display: flex;
  flex-direction: column;

  ${DESKTOP} {
    flex: 1;
    justify-content: center;
  }
`;

/** The guide's line: the brand voice, not the page heading. */
const Display = styled.p`
  margin: 0;
  font-weight: 900;
  font-size: clamp(3rem, 5.2vw, 5.5rem);
  line-height: 0.9;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);

  span {
    display: block;
  }
`;

const Title = styled.h1`
  margin: 1.5rem 0 0;
  max-width: 26ch;
  font-size: clamp(1.15rem, 1.7vw, 1.4rem);
  font-weight: 600;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.92);
  text-wrap: balance;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1.5rem;
  margin-top: 2rem;
`;

const Primary = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 52px;
  padding: 0 1.6rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${INK};
  font-size: 1.05rem;
  font-weight: 700;
  text-decoration: none;

  @media (prefers-reduced-motion: no-preference) {
    transition: background 0.2s, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Secondary = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: #fff;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 5px;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

/** Pick a guide: each button shows the mascot and its name. */
/** The cast: five equal tiles, portrait over name; the row's foot lines up with the badge cards' foot. */
const Picker = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 2.5rem;

  ${DESKTOP} {
    max-width: 460px;
    gap: 0.75rem;
    margin: 2rem 0 1.25rem;
  }
`;

const Guide = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.25rem 0;
  border: none;
  background: none;
  color: ${({ $active, theme }) => ($active ? theme.colors.accent : "rgba(255, 255, 255, 0.85)")};
  font: inherit;
  font-size: 0.9rem;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  cursor: pointer;

  span {
    position: relative;
    display: block;
    width: min(100%, 64px);
    aspect-ratio: 1;
    border-radius: 50%;
    overflow: hidden;
    /* The active guide gets the accent ring; the rest sit back a little. */
    box-shadow: 0 0 0 2px ${INK}, 0 0 0 ${({ $active }) => ($active ? "4px" : "3px")} ${({ $active, theme }) => ($active ? theme.colors.accent : "rgba(255, 255, 255, 0.25)")};
    opacity: ${({ $active }) => ($active ? 1 : 0.72)};

    @media (prefers-reduced-motion: no-preference) {
      transition: opacity 0.2s, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
    }
  }

  img {
    object-fit: cover;
  }

  &:hover span {
    opacity: 1;
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: none;
  }

  &:focus-visible span {
    box-shadow: 0 0 0 2px ${INK}, 0 0 0 5px #fff;
  }
`;

/** The approved badge slider, docked in the portrait's lower corner. */
const Dock = styled.div`
  position: relative;
  z-index: 1;
  margin-top: 2.5rem;
  padding: 0 ${GUTTER} 2.5rem;

  ${DESKTOP} {
    align-self: end;
    margin-top: 0;
    padding: 0 ${GUTTER} 0 0;
  }
`;

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const slide = HERO_SLIDES[index];

  return (
    <Hero aria-labelledby="hero-title">
      {HERO_SLIDES.map((s, i) => (
        <Slide key={s.image} $active={i === index} aria-hidden="true">
          <Image
            src={s.image}
            alt=""
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 70vw, 100vw"
            style={{ objectPosition: FOCUS[s.image] ?? "50% 12%" }}
          />
        </Slide>
      ))}
      <Scrim />

      <Copy>
        <Lead>
        <Display className={roboto.className} aria-live="polite">
          <span>{slide.titleMain}</span>
          <span>{slide.titleSub}</span>
        </Display>
        <Title id="hero-title">Outdoor and local experiences across Romania, hosted by the people who live there</Title>
        <Actions>
          <Primary href="/experiences">Browse experiences</Primary>
          <Secondary href="/experiences/new">Host an experience</Secondary>
        </Actions>
        </Lead>
        <Picker role="group" aria-label="Choose a guide">
          {HERO_SLIDES.map((s, i) => (
            <Guide key={s.image} type="button" $active={i === index} aria-pressed={i === index} onClick={() => setIndex(i)}>
              <span>
                <Image src={s.image} alt="" fill sizes="64px" />
              </span>
              {NAMES[s.image] ?? `Guide ${i + 1}`}
            </Guide>
          ))}
        </Picker>
      </Copy>

      <Dock>
        <ChallengeBadgesSlider key={index} challenges={slide.challenges} title={slide.badgeSectionTitle} dense />
      </Dock>
    </Hero>
  );
}
