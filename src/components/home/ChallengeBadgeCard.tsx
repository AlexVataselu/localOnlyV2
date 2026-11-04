"use client";

import { useState } from "react";
import Image from "next/image";
import styled from "styled-components";
import type { LucideIcon } from "lucide-react";

const Wrap = styled.button`
  display: block;
  width: 100%;
  height: 320px;
  padding: 0;
  border: none;
  background: none;
  perspective: 900px;
  cursor: pointer;
  text-align: inherit;
  color: inherit;
  border-radius: 24px;
`;

const Inner = styled.div<{ $flipped: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;

  @media (prefers-reduced-motion: no-preference) {
    transition: transform 0.5s ease;
    transform: rotateY(${({ $flipped }) => ($flipped ? "180deg" : "0deg")});
  }
`;

const Face = styled.div<{ $back?: boolean; $flipped: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  box-shadow: ${({ theme }) => theme.shadows.card};
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;

  @media (prefers-reduced-motion: no-preference) {
    transform: ${({ $back }) => ($back ? "rotateY(180deg)" : "none")};
  }

  /* Without motion, swap faces instead of rotating. */
  @media (prefers-reduced-motion: reduce) {
    visibility: ${({ $back, $flipped }) => ($back === $flipped ? "visible" : "hidden")};
  }
`;

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textPrimary};

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.accentText};
  }
`;

const Middle = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Hint = styled.div`
  padding: 0.7rem 1rem;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-align: center;
  text-transform: uppercase;
`;

const BadgeImage = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
`;

const BackTitle = styled.p`
  margin: 0;
  padding: 0 1rem 1.25rem;
  text-align: center;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export interface ChallengeBadgeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badgeSrc?: string;
}

export default function ChallengeBadgeCard({ title, description, icon: Icon, badgeSrc = "/badge.png" }: ChallengeBadgeCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <Wrap
      type="button"
      aria-pressed={flipped}
      aria-label={`${title} badge: ${description}. ${flipped ? "Showing badge." : "Show badge."}`}
      onClick={() => setFlipped((v) => !v)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setFlipped(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setFlipped(false)}
    >
      <Inner $flipped={flipped} aria-hidden>
        <Face $flipped={flipped}>
          <Top>
            <Icon size={22} aria-hidden />
            {title}
          </Top>
          <Middle>{description}</Middle>
          <Hint>Tap to see the badge</Hint>
        </Face>
        <Face $back $flipped={flipped}>
          <Middle>
            <BadgeImage>
              <Image src={badgeSrc} alt="" fill sizes="150px" style={{ objectFit: "contain" }} />
            </BadgeImage>
          </Middle>
          <BackTitle>{title}</BackTitle>
        </Face>
      </Inner>
    </Wrap>
  );
}
