"use client";

import styled from "styled-components";
import { Section } from "@/components/ui/SectionHeading";

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: clamp(1rem, 3vw, 2rem);
  max-width: 1100px;
  margin: 0 auto;
  padding: 0;
  list-style: none;
`;

const Card = styled.li`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: clamp(1.5rem, 3vw, 2.25rem);
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  border-left: 8px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.glass};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Title = styled.h3`
  margin: 0;
  font-family: var(--font-display), sans-serif;
  font-weight: 900;
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  line-height: 1.05;
  color: ${({ theme }) => theme.colors.textPrimary};

  span {
    display: block;
    font-size: 0.6em;
    line-height: 1.3;
  }
`;

const Text = styled.p`
  margin: 0;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* Each promise must be true of the product today. */
const CARDS = [
  {
    title: "Hosted by locals",
    sub: "Not tour operators",
    text: "Every experience is run by someone who lives there: guides, cooks and instructors from across Romania.",
  },
  {
    title: "Know your host",
    sub: "Before you go",
    text: "Each listing shows who runs it, where it happens, how long it takes and when in the day it runs.",
  },
  {
    title: "Prices in lei",
    sub: "Set by the host",
    text: "What you see is the host's price per person, in Romanian lei.",
  },
];

export default function FeatureCards() {
  return (
    <Section aria-label="Why Locals Only">
      <Grid>
        {CARDS.map((c) => (
          <Card key={c.title}>
            <Title>
              {c.title}
              <span>{c.sub}</span>
            </Title>
            <Text>{c.text}</Text>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}
