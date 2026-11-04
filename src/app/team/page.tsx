"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import { CARD_IMAGE_RATIO } from "@/components/ExperienceCard";

const TRAINER_IMAGES = [
  "/fox.png",
  "/bear.png",
  "/lynx.png",
  "/wolf.png",
  "/dog.png",
] as const;

const TRAINERS = Array.from({ length: 9 }, (_, i) => ({
  name: "Alex Puma",
  image: TRAINER_IMAGES[i % TRAINER_IMAGES.length],
  role: "RAIDER TRAINER",
  price: "from 450 Lei/h",
}));

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

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const StarsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.15rem;
`;

const Star = styled.span`
  font-size: 1rem;
  color: #ffd700;
  opacity: 1;
  line-height: 1;
`;

const Price = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accentText};
  white-space: nowrap;
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

function TrainerCard({
  name,
  image,
  role,
  price,
}: {
  name: string;
  image: string;
  role: string;
  price: string;
}) {
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
        <BottomRow>
          <StarsContainer role="img" aria-label="Rating 5 out of 5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} aria-hidden="true">
                ★
              </Star>
            ))}
          </StarsContainer>
          <Price>{price}</Price>
        </BottomRow>
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
          The people behind Locals Only are passionate about connecting travelers with
          authentic local experiences. We believe in community, sustainability, and
          adventure.
        </Lead>
        <Grid>
          {TRAINERS.map((t, i) => (
            <TrainerCard
              key={i}
              name={t.name}
              image={t.image}
              role={t.role}
              price={t.price}
            />
          ))}
        </Grid>
        <FooterText>
          Proiect organizat de asociatia Lala Land. Interested in joining the team or
          becoming a host? Get in touch via our{" "}
          <FooterLink href="/contact">Contact</FooterLink> page.
        </FooterText>
      </Main>
      <AppFooter />
    </PageWrapper>
  );
}
