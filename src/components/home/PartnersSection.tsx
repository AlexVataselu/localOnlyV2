"use client";

import Image from "next/image";
import styled from "styled-components";
import SectionHeading, { Section } from "@/components/ui/SectionHeading";

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(180px, 40vw), 1fr));
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Logo = styled.li`
  position: relative;
  height: 130px;

  img {
    object-fit: contain;
  }
`;

const PARTNERS = [
  { src: "/logo-popasul-uriasilor-albastru.png", name: "Popasul Uriașilor" },
  { src: "/logoAzugaSki&Bike.png", name: "Azuga Ski & Bike Resort" },
  { src: "/v8-logo-mtb-azuga.png", name: "V8 Mountain Bike Azuga" },
  { src: "/awesome.png", name: "Awesome" },
];

export default function PartnersSection() {
  return (
    <Section aria-labelledby="partners-title">
      <SectionHeading id="partners-title" title="Partners" />
      <Grid>
        {PARTNERS.map((p) => (
          <Logo key={p.src}>
            <Image src={p.src} alt={p.name} fill sizes="(max-width: 600px) 40vw, 240px" />
          </Logo>
        ))}
      </Grid>
    </Section>
  );
}
