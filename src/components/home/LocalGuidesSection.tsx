"use client";

import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import Carousel from "@/components/ui/Carousel";
import Rating from "@/components/ui/Rating";
import { ErrorState, Skeleton } from "@/components/ui/Status";
import { useHostsQuery } from "@/hooks/useHostsQuery";
import { mascotFor, portraitFor } from "@/lib/mascots";
import { formatPrice, pluralize } from "@/utils/formatters";

const Card = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.glassBorder};
  border-bottom: 4px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  box-shadow: ${({ theme }) => theme.shadows.card};

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`;

const Photo = styled.div`
  position: relative;
  aspect-ratio: 1;
  background: ${({ theme }) => theme.colors.surface};

  img {
    object-fit: cover;
    object-position: 50% 20%;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem;
`;

const Name = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors.textPrimary};

  a {
    color: inherit;
    text-decoration: none;
  }
  a::after {
    content: "";
    position: absolute;
    inset: 0;
  }
  a:focus-visible {
    outline: none;
  }
`;

const Persona = styled.p`
  margin: 0;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accentText};
`;

const Where = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const NameRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
`;

const Bio = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 0.4rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Skeletons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(260px, 75vw), 1fr));
  gap: 1.25rem;
`;

export default function LocalGuidesSection() {
  const { data: hosts, isPending, isError, refetch } = useHostsQuery(12);

  // With no hosts yet there's nothing honest to show; skip the section.
  if (!isPending && !isError && (!hosts || hosts.length === 0)) return null;

  const fallback = isPending ? (
    <Skeletons aria-busy="true" aria-label="Loading hosts">
      <Skeleton $height="320px" />
      <Skeleton $height="320px" />
      <Skeleton $height="320px" />
    </Skeletons>
  ) : isError ? (
    <ErrorState title="We couldn't load hosts" onRetry={() => refetch()} />
  ) : undefined;

  return (
    <Carousel
      headingId="guides-title"
      title="Meet the locals"
      lead="The people behind the experiences. Pick a host to see everything they run."
      label="hosts"
      itemWidth="min(260px, 75vw)"
      fallback={fallback}
    >
      {(hosts ?? []).map((host) => {
        const mascot = mascotFor(host);
        return (
          <Card key={host.id}>
            <Photo>
              <Image src={portraitFor(host)} alt="" fill sizes="260px" />
            </Photo>
            <Body>
              <NameRow>
                <Name>
                  <Link href={`/experiences?hostId=${encodeURIComponent(host.id)}`}>{host.name ?? "Local host"}</Link>
                </Name>
                <Rating rating={host.rating} count={host.ratingCount} />
              </NameRow>
              <Persona>{mascot.name}</Persona>
              {host.locations[0] && <Where>{host.locations[0]}</Where>}
              {host.bio && <Bio>{host.bio}</Bio>}
              <Row>
                <span>{pluralize(host.experienceCount, "experience", "experiences")}</span>
                <span>
                  from <strong>{formatPrice(host.fromPrice)}</strong>
                </span>
              </Row>
            </Body>
          </Card>
        );
      })}
    </Carousel>
  );
}
