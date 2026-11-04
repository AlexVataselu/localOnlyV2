"use client";

import styled from "styled-components";
import { Bike, Bird, Compass, Footprints, Leaf } from "lucide-react";
import Carousel from "@/components/ui/Carousel";
import ChallengeBadgeCard from "./ChallengeBadgeCard";

const Soon = styled.span`
  display: inline-block;
  margin-left: 0.6rem;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentText};
  font-family: var(--font-body), sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  vertical-align: middle;
`;

const CHALLENGES = [
  { id: "foraging", title: "Foraging", icon: Leaf, description: "Identify plants and fungi, and know what's safe to pick." },
  { id: "orienteering", title: "Orienteering", icon: Compass, description: "Find your way across changing terrain with map and compass." },
  { id: "trail-running", title: "Trail running", icon: Footprints, description: "Endurance and footwork on steep, technical trails." },
  { id: "bird-watching", title: "Bird watching", icon: Bird, description: "Patience, sharp eyes and knowledge of local species." },
  { id: "mountain-biking", title: "Mountain biking", icon: Bike, description: "Bike handling, balance and reading the trail ahead." },
];

export default function BadgesSection() {
  return (
    <Carousel
      headingId="badges-title"
      title={
        <>
          Skill badges <Soon>Coming soon</Soon>
        </>
      }
      lead="Learn a skill with a local, earn its badge, and challenge your friends to collect the set."
      label="skill badges"
      itemWidth="min(260px, 75vw)"
    >
      {CHALLENGES.map((c) => (
        <ChallengeBadgeCard key={c.id} title={c.title} description={c.description} icon={c.icon} />
      ))}
    </Carousel>
  );
}
