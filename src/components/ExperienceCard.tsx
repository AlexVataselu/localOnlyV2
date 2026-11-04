"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import { Experience } from "@/types/experience";
import { formatPrice } from "@/utils/formatters";

export const CARD_IMAGE_RATIO = 1.5; // 3:2 aspect ratio

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  /* Solid glass-like background: avoids expensive backdrop-filter on every card */
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  contain: layout paint;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.14);
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

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.25rem;
`;

const Tag = styled.span`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentText};
  }
`;

const Location = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const Host = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
`;

const BottomRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StarsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.15rem;
`;

const Star = styled.span<{ $filled: boolean }>`
  font-size: 1rem;
  color: ${({ $filled, theme }) => 
    $filled ? '#FFD700' : theme.colors.textSecondary};
  opacity: ${({ $filled }) => $filled ? 1 : 0.3};
  line-height: 1;
`;

const RatingValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Price = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accentText};
  white-space: nowrap;
`;

function ExperienceCardComponent({
  experience,
  headingLevel = "h3",
}: {
  experience: Experience;
  /** h2 when cards sit directly under the page's h1 (the listing), h3 under a section heading. */
  headingLevel?: "h2" | "h3";
}) {
  const rating = experience.rating;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  // Collect all filter tags
  const tags: string[] = [];
  if (experience.activityTypes && experience.activityTypes.length > 0) {
    tags.push(...experience.activityTypes);
  }
  if (experience.timeOfDays && experience.timeOfDays.length > 0) {
    tags.push(...experience.timeOfDays);
  }
  if (experience.duration) {
    tags.push(experience.duration);
  }
  if (experience.specials && experience.specials.length > 0) {
    tags.push(...experience.specials);
  }

  return (
    <Card href={`/experiences/${experience.id}`} scroll={false}>
      <ImageWrapper>
        <Image
          src={experience.image}
          alt={experience.title}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
          style={{ objectFit: "cover" }}
        />
      </ImageWrapper>
      <Info>
        <TopSection>
          <Title as={headingLevel}>{experience.title}</Title>
          {tags.length > 0 && (
            <TagsContainer>
              {tags.map((tag, index) => (
                <Tag key={`${tag}-${index}`}>{tag}</Tag>
              ))}
            </TagsContainer>
          )}
          <Location>{experience.location}</Location>
          {experience.hostName && <Host>Hosted by {experience.hostName}</Host>}
        </TopSection>
        <BottomRow>
          <Rating aria-label={`Rating ${rating.toFixed(1)} out of 5`}>
            <StarsContainer>
              {Array.from({ length: fullStars }).map((_, i) => (
                <Star key={`full-${i}`} $filled={true} aria-hidden="true">
                  ★
                </Star>
              ))}
              {hasHalfStar && (
                <Star $filled={true} aria-hidden="true" style={{ opacity: 0.6 }}>
                  ★
                </Star>
              )}
              {Array.from({ length: emptyStars }).map((_, i) => (
                <Star key={`empty-${i}`} $filled={false} aria-hidden="true">
                  ★
                </Star>
              ))}
            </StarsContainer>
            <RatingValue>{rating.toFixed(1)}</RatingValue>
          </Rating>
          <Price>{formatPrice(experience.price)}</Price>
        </BottomRow>
      </Info>
    </Card>
  );
}

export default memo(ExperienceCardComponent);

