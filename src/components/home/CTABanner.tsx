"use client";

import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";

const Section = styled.section`
  width: 100%;
  padding: clamp(3rem, 7vw, 5rem) clamp(24px, 5vw, 80px);
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Inner = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: clamp(2rem, 4vw, 3.5rem);

  @media (max-width: 900px) {
    flex-direction: column;
    gap: 2rem;
  }
`;

const LogoWrap = styled.div`
  flex-shrink: 0;
  position: relative;
  width: clamp(160px, 22vw, 260px);
  height: clamp(200px, 28vw, 320px);

  @media (max-width: 900px) {
    width: 180px;
    height: 224px;
  }
`;

const RightRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  flex: 1;
  min-width: 0;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1.75rem;
  }
`;

const Frame = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: 0;
  width: 100%;
  max-width: 560px;
  flex-grow: 1;
`;

const MainText = styled.div`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.3;
  letter-spacing: 0.02em;
`;

const Small = styled.span`
  font-size: clamp(1.05rem, 1.8vw, 1.35rem);
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Emph = styled.span`
  font-size: clamp(2rem, 4.5vw, 3rem);
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  letter-spacing: 0.02em;
`;

const SubText = styled.p`
  margin: 0;
  font-size: clamp(1rem, 1.4vw, 1.15rem);
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
  margin-top: 0.25rem;
`;

const CtaButton = styled(Link)`
  display: inline-block;
  margin-top: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: clamp(0.95rem, 1.2vw, 1.1rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
    transform: scale(1.03);
  }
`;

const Tags = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;

  @media (max-width: 900px) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    gap: 0.75rem;
  }
`;

const Tag = styled(Link)`
  display: inline-block;
  padding: 0.7rem 1.25rem;
  border-radius: 10px;
  font-size: clamp(0.85rem, 1.1vw, 0.95rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.95);
  color: #1f1f1f;
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: opacity 0.2s, transform 0.2s, background 0.2s;

  &:hover {
    background: #fff;
    transform: scale(1.02);
  }
`;

export default function CTABanner() {
  return (
    <Section>
      <Inner>
        <LogoWrap>
          <Image
            src="/logoSample.png"
            alt="Locals Only"
            fill
            style={{ objectFit: "contain" }}
          />
        </LogoWrap>
        <RightRow>
          <Frame>
            <MainText>
              <Small>Not just an </Small>
              <Emph>experience,</Emph>
              <br />
              <Small>but the way of </Small>
              <Emph>local living</Emph>
            </MainText>
            <SubText>Travel and experience the local activities</SubText>
            <CtaButton href="/experiences">All experiences</CtaButton>
          </Frame>
          <Tags>
            <Tag href="/experiences">Extreme Adventures</Tag>
            <Tag href="/experiences">Sports</Tag>
            <Tag href="/experiences">Foraging</Tag>
          </Tags>
        </RightRow>
      </Inner>
    </Section>
  );
}
