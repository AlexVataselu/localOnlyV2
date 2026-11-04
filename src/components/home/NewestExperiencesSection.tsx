"use client";

import Link from "next/link";
import styled from "styled-components";
import ExperienceCard from "@/components/ExperienceCard";
import Carousel from "@/components/ui/Carousel";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/Status";
import { useExperiencesQuery } from "@/hooks/useExperiencesQuery";
import { DEFAULT_FILTERS } from "@/types/filters";

const ShowAll = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accentText};
  text-decoration: underline;
  text-underline-offset: 4px;
`;

const Skeletons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 82vw), 1fr));
  gap: 1.25rem;
`;

export default function NewestExperiencesSection() {
  const { data, isPending, isError, refetch } = useExperiencesQuery(DEFAULT_FILTERS, 8);
  const experiences = data?.pages[0]?.items ?? [];

  const fallback = isPending ? (
    <Skeletons aria-busy="true" aria-label="Loading experiences">
      <Skeleton $height="360px" />
      <Skeleton $height="360px" />
      <Skeleton $height="360px" />
    </Skeletons>
  ) : isError ? (
    <ErrorState title="We couldn't load experiences" message="This is on our side. Try again in a moment." onRetry={() => refetch()} />
  ) : experiences.length === 0 ? (
    <EmptyState title="No experiences yet">
      <p>Hosts are adding their first listings. Check back soon.</p>
    </EmptyState>
  ) : undefined;

  return (
    <Carousel
      headingId="newest-title"
      title="Newest experiences"
      label="newest experiences"
      actions={<ShowAll href="/experiences">Show all</ShowAll>}
      fallback={fallback}
    >
      {experiences.map((exp) => (
        <ExperienceCard key={exp.id} experience={exp} />
      ))}
    </Carousel>
  );
}
