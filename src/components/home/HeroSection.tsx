"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SearchBar, { type SearchValues } from "@/components/SearchBar";
import { HEADER_HEIGHT } from "@/components/ui/SiteHeader";

/** `focus` is the object-position that keeps each mascot's face in frame on wide screens. */
const SLIDES = [
  { image: "/bear.png", top: "The bear", bottom: "necessities", focus: "40% 18%" },
  { image: "/fox.png", top: "The fox's", bottom: "den", focus: "50% 18%" },
  { image: "/lynx.png", top: "The lynx's", bottom: "trail", focus: "50% 15%" },
  { image: "/wolf.png", top: "The wolf", bottom: "pack", focus: "55% 18%" },
  { image: "/dog.png", top: "The dog's", bottom: "journey", focus: "50% 15%" },
];

const Hero = styled.section`
  position: relative;
  min-height: min(100svh, 960px);
  display: flex;
  overflow: hidden;
  /* Photography stays dark in both themes, so the hero uses on-image tokens. */
  color: ${({ theme }) => theme.colors.onImage};
  background: #0f1116 url("/topo.jpg") center / cover no-repeat;
  background-blend-mode: soft-light;
`;

/* Desktop: the square portrait sits in the right ~62% (barely cropped) and
   fades into the topo texture where the copy lives. Mobile: full bleed. */
const DESKTOP = "@media (min-width: 960px)";

const Slide = styled.div<{ $active: boolean }>`
  position: absolute;
  inset: 0;
  opacity: ${({ $active }) => ($active ? 1 : 0)};

  @media (prefers-reduced-motion: no-preference) {
    transition: opacity 0.6s ease;
  }

  img {
    object-fit: cover;
  }

  ${DESKTOP} {
    left: 38%;
  }
`;

const Shade = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.1) 35%, rgba(0, 0, 0, 0.75) 100%);

  ${DESKTOP} {
    background:
      linear-gradient(90deg, #0f1116 39%, rgba(15, 17, 22, 0.7) 49%, rgba(15, 17, 22, 0) 68%),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 0.45) 100%);
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Sit in the lower half so the mascot's face stays visible above. */
  justify-content: flex-end;
  gap: 1.1rem;
  padding: calc(${HEADER_HEIGHT}px + 2rem) clamp(16px, 5vw, 80px) 6.5rem;
  text-align: center;

  ${DESKTOP} {
    align-items: flex-start;
    justify-content: center;
    max-width: min(46%, 640px);
    margin-left: clamp(16px, 5vw, 80px);
    padding-inline: 0;
    text-align: left;
  }
`;

/** The mascot line: a brand moment, not the page heading. */
const Display = styled.p`
  margin: 0;
  font-family: var(--font-hero), sans-serif;
  font-weight: 900;
  font-size: clamp(2.5rem, 8vw, 5.25rem);
  line-height: 0.92;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onImageMuted};
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);

  span {
    display: block;
  }
`;

const Title = styled.h1`
  margin: 0.5rem 0 0;
  max-width: 28ch;
  font-family: var(--font-display), sans-serif;
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  font-weight: 700;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.onImage};
`;

const SearchWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;

  ${DESKTOP} {
    justify-content: flex-start;
  }
`;

const Browse = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.onImage};
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }

  ${DESKTOP} {
    padding-inline: 0;
  }
`;

const Controls = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${DESKTOP} {
    left: 69%;
  }
`;

const ArrowButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.onImageBorder};
  background: ${({ theme }) => theme.colors.onImageSurface};
  color: ${({ theme }) => theme.colors.onImage};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.onImageSurfaceHover};
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
    background: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.onImageMuted)};
  }
`;

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const slide = SLIDES[index];

  const go = (delta: number) => setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);

  const handleSearch = ({ location, q }: SearchValues) => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (q) params.set("q", q);
    const query = params.toString();
    router.push(query ? `/experiences?${query}` : "/experiences");
  };

  return (
    <Hero aria-labelledby="hero-title">
      {SLIDES.map((s, i) => (
        <Slide key={s.image} $active={i === index} aria-hidden={i !== index}>
          <Image src={s.image} alt="" fill priority={i === 0} sizes="100vw" style={{ objectPosition: s.focus }} />
        </Slide>
      ))}
      <Shade />

      <Content>
        <Display aria-live="polite">
          <span>{slide.top}</span>
          <span>{slide.bottom}</span>
        </Display>
        <Title id="hero-title">Outdoor and local experiences across Romania, hosted by the people who live there</Title>
        <SearchWrap>
          <SearchBar variant="hero" onSubmit={handleSearch} />
        </SearchWrap>
        <Browse href="/experiences">or browse every experience</Browse>
      </Content>

      <Controls role="group" aria-label="Hero image">
        <ArrowButton type="button" onClick={() => go(-1)} aria-label="Previous image">
          <ChevronLeft size={22} aria-hidden />
        </ArrowButton>
        {SLIDES.map((s, i) => (
          <Dot
            key={s.image}
            type="button"
            $active={i === index}
            aria-label={`Image ${i + 1} of ${SLIDES.length}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => setIndex(i)}
          />
        ))}
        <ArrowButton type="button" onClick={() => go(1)} aria-label="Next image">
          <ChevronRight size={22} aria-hidden />
        </ArrowButton>
      </Controls>
    </Hero>
  );
}
