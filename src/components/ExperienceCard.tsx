"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import Rating from "@/components/ui/Rating";
import type { Experience } from "@/types/experience";
import { ACTIVITY_TYPE_LABELS, DURATION_LABELS } from "@/types/filters";
import { formatPrice } from "@/utils/formatters";

export const CARD_IMAGE_RATIO = 1.5; // 3:2

const Card = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  background: ${({ theme }) => theme.colors.glass};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: ${({ theme }) => theme.shadows.card};

  &:hover {
    background: ${({ theme }) => theme.colors.glassHover};
    box-shadow: ${({ theme }) => theme.shadows.cardHover};
  }

  @media (prefers-reduced-motion: no-preference) {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    &:hover {
      transform: translateY(-3px);
    }
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: ${CARD_IMAGE_RATIO};
  background: ${({ theme }) => theme.colors.surface};
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 1rem 1.1rem 1.1rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

/** Whole card is clickable; the link text is the title. */
const CardLink = styled(Link)`
  color: inherit;
  text-decoration: none;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
  }

  &:focus-visible {
    outline: none;
  }
`;

const Meta = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Tags = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0.2rem 0 0;
  padding: 0;
  list-style: none;

  li {
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    font-size: 0.75rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
  padding-top: 0.6rem;
`;

const Price = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;

  strong {
    font-size: 1.15rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

function ExperienceCard({
  experience,
  priority = false,
  headingLevel = "h3",
}: {
  experience: Experience;
  priority?: boolean;
  /** h2 when the card sits directly under the page's h1 (listing page), h3 under a section heading. */
  headingLevel?: "h2" | "h3";
}) {
  const tags = [
    ...experience.activityTypes.slice(0, 2).map((t) => ACTIVITY_TYPE_LABELS[t]),
    ...(experience.duration ? [DURATION_LABELS[experience.duration]] : []),
  ];

  return (
    <Card>
      <ImageWrapper>
        <Image
          src={experience.image}
          alt=""
          fill
          sizes="(max-width: 720px) 100vw, (max-width: 1080px) 50vw, 33vw"
          priority={priority}
          style={{ objectFit: "cover" }}
        />
      </ImageWrapper>
      <Body>
        <Title as={headingLevel}>
          <CardLink href={`/experiences/${experience.id}`}>{experience.title}</CardLink>
        </Title>
        <Meta>
          {experience.location}
          {experience.host.name ? ` · with ${experience.host.name}` : ""}
        </Meta>
        {tags.length > 0 && (
          <Tags aria-label="Details">
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </Tags>
        )}
        <Bottom>
          <Rating rating={experience.rating} count={experience.ratingCount} />
          <Price>
            <strong>{formatPrice(experience.price)}</strong> / person
          </Price>
        </Bottom>
      </Body>
    </Card>
  );
}

export default memo(ExperienceCard);
