"use client";

import Image from "next/image";
import styled from "styled-components";

const Section = styled.section`
  width: 100%;
  padding: 3rem clamp(24px, 5vw, 80px);
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Inner = styled.div`
  width: 100%;
`;

const TitleWrap = styled.div`
  position: relative;
  display: inline-block;
  width: fit-content;
  padding-left: 12px;
  padding-bottom: 8px;
  margin-bottom: 2rem;

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2.5rem;
  align-items: center;
  justify-items: center;
`;

const PartnerLogo = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 160px;

  & img {
    object-fit: contain;
  }
`;

const PARTNERS = [
  { id: "popasul-1", src: "/logo-popasul-uriasilor-albastru.png", alt: "Popasul Uriasilor" },
  { id: "azuga-1", src: "/logoAzugaSki&Bike.png", alt: "Azuga Ski & Bike" },
  { id: "v8-1", src: "/v8-logo-mtb-azuga.png", alt: "V8 MTB Azuga" },
  { id: "awesome-1", src: "/awesome.png", alt: "Awesome" },
  
];

export default function PartnersSection() {
  return (
    <Section>
      <Inner>
        <TitleWrap>
          <Title>Partners</Title>
        </TitleWrap>
        <Grid>
          {PARTNERS.map((p) => (
            <PartnerLogo key={p.id}>
              <Image src={p.src} alt={p.alt} fill sizes="(max-width: 600px) 240px, 280px" style={{ objectFit: "contain" }} />
            </PartnerLogo>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
}
