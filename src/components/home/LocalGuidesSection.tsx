"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { useElementWidth } from "@/hooks/useElementWidth";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

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

const NavArrowsWrap = styled.div`
  display: inline-flex;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.accent};
  border-radius: 10px;
  overflow: hidden;
`;

const NavArrowBtn = styled.button<{ $active?: boolean }>`
  width: 44px;
  height: 44px;
  border: none;
  background: ${({ $active, theme }) => ($active ? "transparent" : "rgba(0, 0, 0, 0.45)")};
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

const Card = styled(Link)`
  flex: 0 0 260px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-bottom: 4px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.surface};
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-2px);
    border-bottom-color: ${({ theme }) => theme.colors.accent};
  }
`;

const ImgWrap = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.colors.border};
  overflow: hidden;

  & img {
    object-fit: cover;
  }
`;

const Info = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const Name = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Role = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.accentText};
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: #eab308;
`;

const Price = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const GUIDES = [
  { id: "1", name: "Alex Puma", role: "Raider Trainer", image: "/lynx.png", rating: 5, price: 450 },
  { id: "2", name: "Mihai Bear", role: "Raider Trainer", image: "/bear.png", rating: 5, price: 450 },
  { id: "3", name: "Andrei Wolf", role: "Raider Trainer", image: "/wolf.png", rating: 5, price: 450 },
  { id: "4", name: "Dan Fox", role: "Raider Trainer", image: "/fox.png", rating: 5, price: 450 },
  { id: "5", name: "Costi Dog", role: "Raider Trainer", image: "/dog.png", rating: 5, price: 450 },
  { id: "6", name: "Mihai Bear", role: "Raider Trainer", image: "/bear.png", rating: 5, price: 450 },
  { id: "7", name: "Andrei Wolf", role: "Raider Trainer", image: "/wolf.png", rating: 5, price: 450 },
  { id: "8", name: "Dan Fox", role: "Raider Trainer", image: "/fox.png", rating: 5, price: 450 },
  { id: "9", name: "Costi Dog", role: "Raider Trainer", image: "/dog.png", rating: 5, price: 450 },
];

const CARD_STEP = 260 + 24;

export default function LocalGuidesSection() {
  const [offset, setOffset] = useState(0);
  const [trackRef, trackWidth] = useElementWidth<HTMLDivElement>(900);
  const containerWidth = trackWidth;
  const totalWidth = GUIDES.length * CARD_STEP - 24;
  const maxScroll = Math.max(0, totalWidth - containerWidth + 48);
  const canGoLeft = offset < 0;
  const canGoRight = offset > -maxScroll;

  const go = (d: number) => setOffset((o) => Math.max(-maxScroll, Math.min(0, o + d)));

  return (
    <Section>
      <Header>
        <TitleWrap>
          <Title>Only local guides</Title>
        </TitleWrap>
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
      </Header>
      <SliderWrap>
        <Track ref={trackRef}>
          <List $offset={offset}>
            {GUIDES.map((g) => (
              <Card key={g.id} href="/experiences">
                <ImgWrap>
                  <Image src={g.image} alt={g.name} fill sizes="260px" />
                </ImgWrap>
                <Info>
                  <Row>
                    <Name>{g.name}</Name>
                    <Rating aria-label={`${g.rating} stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </Rating>
                  </Row>
                  <Row>
                    <Role>{g.role}</Role>
                    <Price>from {g.price} Lei/h</Price>
                  </Row>
                </Info>
              </Card>
            ))}
          </List>
        </Track>
      </SliderWrap>
    </Section>
  );
}
