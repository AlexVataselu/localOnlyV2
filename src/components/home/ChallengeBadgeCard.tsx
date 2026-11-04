"use client";

import { useState } from "react";
import Image from "next/image";
import styled from "styled-components";

const CardWrap = styled.div`
  perspective: 1000px;
  flex-shrink: 0;
  width: 300px;
  height: 380px;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
  overflow: visible;
  border-radius: 32px;
  isolation: isolate;
  position: relative;
  z-index: 0;
  &:hover {
    z-index: 1;
  }
`;

const CardInner = styled.div<{ $flipped: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform: rotateY(${({ $flipped }) => ($flipped ? "180deg" : "0deg")});
  transition: transform 0.5s ease;
`;

const Face = styled.div`
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: 32px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: translateZ(0);
  /* glassmorphism */
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const FaceFront = styled(Face)`
  /* Face base has glass; TopBar/BottomBar overlay their own bg */
`;

const FaceBack = styled(Face)`
  transform: rotateY(180deg) translateZ(0);
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const TopBar = styled.div<{ $complete: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: ${({ $complete, theme }) => ($complete ? theme.colors.accent : "rgba(30, 32, 38, 0.9)")};
  color: ${({ $complete, theme }) => ($complete ? theme.colors.onAccent : "#fff")};
`;

const Icon = styled.div`
  font-size: 1.75rem;
  line-height: 1;
  flex-shrink: 0;
`;

const TopTitle = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const Middle = styled.div`
  flex: 1;
  min-height: 140px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Desc = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
`;

const BadgeImage = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
`;

const BottomBar = styled.div<{ $complete: boolean }>`
  padding: 0.85rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
  background: ${({ $complete, theme }) => ($complete ? theme.colors.accent : "rgba(255, 255, 255, 0.95)")};
  color: #1f1f1f;
`;

const BackTitle = styled.span`
  font-size: 1.05rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-top: 1.25rem;
  text-align: center;
`;

export interface ChallengeBadgeCardProps {
  title: string;
  description: string;
  icon: string;
  complete: boolean;
  badgeSrc?: string;
  /** When !complete, use this instead of "BADGE INCOMPLETE" (e.g. "BADGE AVAILABLE") */
  incompleteLabel?: string;
}

export default function ChallengeBadgeCard({
  title,
  description,
  icon,
  complete,
  badgeSrc = "/badge.png",
  incompleteLabel = "BADGE INCOMPLETE",
}: ChallengeBadgeCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <CardWrap
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <CardInner $flipped={flipped}>
        <FaceFront>
          <TopBar $complete={complete}>
            <Icon>{icon}</Icon>
            <TopTitle>{title}</TopTitle>
          </TopBar>
          <Middle>
            {complete ? (
              <BadgeImage>
                <Image src={badgeSrc} alt={title} fill style={{ objectFit: "contain" }} />
              </BadgeImage>
            ) : (
              <Desc>{description}</Desc>
            )}
          </Middle>
          <BottomBar $complete={complete}>
            {complete ? "BADGE COMPLETED" : incompleteLabel}
          </BottomBar>
        </FaceFront>
        <FaceBack>
          <BadgeImage>
            <Image src={badgeSrc} alt={title} fill style={{ objectFit: "contain" }} />
          </BadgeImage>
          <BackTitle>{title}</BackTitle>
        </FaceBack>
      </CardInner>
    </CardWrap>
  );
}
