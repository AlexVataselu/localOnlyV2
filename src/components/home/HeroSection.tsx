"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Roboto } from "next/font/google";
import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChallengeBadgesSlider from "./ChallengeBadgesSlider";
import { HERO_SLIDES } from "./heroSlideData";
import { SearchParams, DEFAULT_SEARCH_PARAMS } from "@/types/search";

const roboto = Roboto({ subsets: ["latin"], weight: ["900"] });

const Hero = styled.section`
  position: relative;
  height: 100vh;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
`;

const Slide = styled.div<{ $active: boolean }>`
  position: absolute;
  inset: 0;
  opacity: ${({ $active }) => ($active ? 1 : 0)};
  pointer-events: ${({ $active }) => ($active ? "auto" : "none")};
  transition: opacity 0.6s ease;
`;

const SlideBg = styled.div`
  position: absolute;
  inset: 0;

  & img {
    object-fit: cover;
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: transparent;
  pointer-events: none;
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem clamp(24px, 5vw, 80px) 2rem;
`;

const TitleBlock = styled.span`
  display: inline-block;
  max-width: min(1400px, 100%);
  margin: 0 0 1.5rem;
  flex: none;
  order: 0;
  flex-grow: 0;
`;

const TitleMain = styled.span`
  display: block;
  white-space: nowrap;
  font-family: "Roboto", sans-serif;
  font-weight: 900;
  font-size: clamp(48px, 12vw, 200px);
  line-height: 1.05; /* 150% made 300px lines that overflowed the hero and clipped under the header */
  text-align: center;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
  text-shadow: 0px 4px 16px rgba(0, 0, 0, 0.35);
  margin: 0;
`;

const TitleSub = styled.span<{ $w?: number }>`
  display: block;
  width: ${({ $w }) => ($w != null && $w > 0 ? `${$w}px` : "100%")};
  max-width: 100%;
  font-family: "Roboto", sans-serif;
  font-weight: 900;
  font-size: clamp(48px, 12vw, 200px);
  line-height: 1.05; /* 150% made 300px lines that overflowed the hero and clipped under the header */
  text-align: center;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
  text-shadow: 0px 4px 16px rgba(0, 0, 0, 0.35);
  margin: 0;
`;

const BadgesWrap = styled.div`
  width: 100%;
  margin-top: 1.5rem;
`;

const HERO_PADDING = "clamp(24px, 5vw, 80px)";

const HeroNavSide = styled.div<{ $side: "left" | "right" }>`
  position: absolute;
  /* Above the badge carousel, whose own arrows sit at mid-height on the right. */
  top: 38%;
  transform: translateY(-50%);
  ${({ $side }) => ($side === "left" ? `left: ${HERO_PADDING};` : `right: ${HERO_PADDING};`)}
  z-index: 10;
`;

const HeroNavBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, border-color 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
    border-color: #fff;
  }
`;

const HeroNavCenter = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0;
  z-index: 10;
`;

/* 8px dot, 24px tap target. */
const Dot = styled.button<{ $active: boolean }>`
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;

  &::after {
    content: "";
    display: block;
    width: 8px;
    height: 8px;
    margin: auto;
    border-radius: 50%;
    background: ${({ $active }) => ($active ? "#fff" : "rgba(255,255,255,0.5)")};
    transition: background 0.2s, transform 0.2s;
  }

  &:hover::after {
    transform: scale(1.2);
  }
`;

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [searchParams, setSearchParams] = useState<SearchParams>(DEFAULT_SEARCH_PARAMS);
  const mainRef = useRef<HTMLSpanElement>(null);
  const [subWidth, setSubWidth] = useState<number | undefined>(undefined);
  const router = useRouter();
  const slide = HERO_SLIDES[index];

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const onResize = () => setSubWidth(el.offsetWidth);
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [slide.titleMain]);

  const go = (delta: number) => {
    setIndex((i) => (i + delta + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const onSearch = useCallback(
    (params: SearchParams) => {
      const q = new URLSearchParams();
      if (params.location) q.set("location", params.location);
      if (params.experience) q.set("experience", params.experience);
      router.push(`/experiences?${q.toString()}`);
    },
    [router]
  );

  return (
    <Hero>
      {HERO_SLIDES.map((s, i) => (
        <Slide key={s.image} $active={i === index}>
          <SlideBg>
            <Image src={s.image} alt="" fill priority={i === 0} sizes="100vw" />
          </SlideBg>
          <Overlay />
        </Slide>
      ))}

      <Content className={roboto.className}>
        <TitleBlock>
          <TitleMain ref={mainRef}>{slide.titleMain}</TitleMain>
          <TitleSub $w={subWidth}>{slide.titleSub}</TitleSub>
        </TitleBlock>
        <BadgesWrap>
          <ChallengeBadgesSlider
            key={index}
            challenges={slide.challenges}
            title={slide.badgeSectionTitle}
          />
        </BadgesWrap>
      </Content>

      <HeroNavSide $side="left">
        <HeroNavBtn type="button" onClick={() => go(-1)} aria-label="Previous slide">
          <ChevronLeft size={24} />
        </HeroNavBtn>
      </HeroNavSide>
      <HeroNavSide $side="right">
        <HeroNavBtn type="button" onClick={() => go(1)} aria-label="Next slide">
          <ChevronRight size={24} />
        </HeroNavBtn>
      </HeroNavSide>
      <HeroNavCenter>
        {HERO_SLIDES.map((_, i) => (
          <Dot
            key={i}
            $active={i === index}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </HeroNavCenter>
    </Hero>
  );
}
