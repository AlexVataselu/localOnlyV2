"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import { CARD_IMAGE_RATIO } from "@/components/ExperienceCard";

/** The local guides from the home page. */
const TRAINERS = [
  { name: "Mihai Bear", image: "/bear.png", role: "Mountain guide · Bucegi", bio: "Twenty winters on the Bucegi ridges. Slow, careful hikes and sunrise climbs." },
  { name: "Dan Fox", image: "/fox.png", role: "Food guide · Transylvania", bio: "Former cook. Kitchens, cellars and markets from Sibiu to Cluj." },
  { name: "Alex Puma", image: "/lynx.png", role: "Bike & ski instructor · Prahova Valley", bio: "Technical trails, early starts and riders who are new to both." },
  { name: "Andrei Wolf", image: "/wolf.png", role: "Wildlife tracker · Piatra Craiului", bio: "Works with local rangers. Small, quiet groups and long evenings in the hide." },
  { name: "Costi Dog", image: "/dog.png", role: "Boatman · Danube Delta", bio: "Pelicans, fishermen's lunches and channels the big boats can't reach." },
];

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  padding: 4rem clamp(24px, 5vw, 80px) 3rem;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Lead = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 2rem;
`;

const Grid = styled.div`
  display: grid;
  width: 100%;
  gap: 32px;
  grid-template-columns: 1fr;

  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1080px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

/* Match ExperienceCard pixel-perfect: liquid glass, 16px radius, same shadows/borders */
const Card = styled.article`
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  backface-visibility: hidden;
  transform: translateZ(0);
  will-change: transform;

  &:hover {
    transform: translateY(-4px) translateZ(0);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: ${CARD_IMAGE_RATIO};
  background: transparent;
`;

const Info = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  justify-content: space-between;
`;

const Name = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Role = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accentText};
  line-height: 1.3;
`;

const Bio = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FooterText = styled.p`
  font-size: 1rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 2rem 0 0;
`;

const FooterLink = styled(Link)`
  color: inherit;
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.accentText};
  }
`;

function TrainerCard({ name, image, role, bio }: { name: string; image: string; role: string; bio: string }) {
  return (
    <Card>
      <ImageWrapper>
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 719px) 100vw, (max-width: 1079px) 50vw, 33vw"
          loading="lazy"
          style={{ objectFit: "cover" }}
        />
      </ImageWrapper>
      <Info>
        <Name>{name}</Name>
        <Role>{role}</Role>
        <Bio>{bio}</Bio>
      </Info>
    </Card>
  );
}

export default function TeamPage() {
  return (
    <PageWrapper>
      <AppHeader title="Team" titleAs="p" />
      <Main>
        <Title>Our Team</Title>
        <Lead>
          Locals Only is a handful of guides who live where they host. Each of them
          writes their own listings and leads every group themselves.
        </Lead>
        <Grid>
          {TRAINERS.map((t) => (
            <TrainerCard key={t.name} {...t} />
          ))}
        </Grid>
        <FooterText>
          A project organised by the Lala Land association. Want to join as a host? Get
          in touch via our <FooterLink href="/contact">Contact</FooterLink> page.
        </FooterText>
      </Main>
      <AppFooter />
    </PageWrapper>
  );
}
