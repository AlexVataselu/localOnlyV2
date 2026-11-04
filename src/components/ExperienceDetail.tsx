"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, MapPin, Pencil, Sun, Trash2 } from "lucide-react";
import AppFooter from "@/components/AppFooter";
import Rating from "@/components/ui/Rating";
import SiteHeader from "@/components/ui/SiteHeader";
import { Button, SecondaryButton } from "@/components/ui/Status";
import { ClientApiError, request } from "@/lib/api/client";
import type { Experience } from "@/types/experience";
import { ACTIVITY_TYPE_LABELS, DURATION_LABELS, SPECIAL_LABELS, TIME_OF_DAY_LABELS } from "@/types/filters";
import { formatPrice } from "@/utils/formatters";

const Main = styled.main`
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem clamp(16px, 5vw, 80px) 0;
`;

const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Hero = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  max-height: 520px;
  width: 100%;
  margin: 0.5rem 0 2rem;
  border-radius: 20px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};

  img {
    object-fit: cover;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const Title = styled.h1`
  margin: 0 0 0.75rem;
  font-family: var(--font-display), sans-serif;
  font-weight: 900;
  font-size: clamp(1.9rem, 4vw, 2.75rem);
  line-height: 1.1;
`;

const Facts = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  margin: 0 0 1.5rem;
  padding: 0;
  list-style: none;
  color: ${({ theme }) => theme.colors.textSecondary};

  li {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
`;

const Description = styled.p`
  margin: 0 0 2rem;
  font-size: 1.1rem;
  line-height: 1.7;
  white-space: pre-line;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Chips = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1.5rem;
  padding: 0;
  list-style: none;

  li {
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surface};
    font-size: 0.9rem;
  }
`;

const SubHeading = styled.h2`
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
`;

const Aside = styled.aside`
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  box-shadow: ${({ theme }) => theme.shadows.card};

  @media (max-width: 860px) {
    position: static;
  }
`;

const PriceLine = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    font-size: 1.75rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Note = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const HostRow = styled.div`
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  a {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const OwnerActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const LinkButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0 1.1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 700;
  text-decoration: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const DangerButton = styled(SecondaryButton)`
  color: ${({ theme }) => theme.colors.danger};
  border-color: ${({ theme }) => theme.colors.danger};
`;

const Confirm = styled.dialog`
  width: min(420px, calc(100vw - 2rem));
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.textPrimary};

  &::backdrop {
    background: rgba(0, 0, 0, 0.55);
  }

  h2 {
    margin: 0 0 0.5rem;
    font-size: 1.2rem;
  }

  p {
    margin: 0 0 1.25rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  div {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.danger};
`;

export default function ExperienceDetail({ experience }: { experience: Experience }) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirmRef = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isOwner = session?.user?.id === experience.host.id && session?.user?.role === "HOST";

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await request(`/experiences/${encodeURIComponent(experience.id)}`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["experiences"] });
      await queryClient.invalidateQueries({ queryKey: ["hosts"] });
      router.push("/experiences");
    } catch (error) {
      setDeleteError(error instanceof ClientApiError ? error.message : "Couldn't delete. Please try again.");
      setDeleting(false);
    }
  };

  const details = [
    ...experience.activityTypes.map((t) => ACTIVITY_TYPE_LABELS[t]),
    ...experience.specials.map((s) => SPECIAL_LABELS[s]),
  ];

  return (
    <>
      <SiteHeader />
      <Main id="main">
        <Back href="/experiences">
          <ArrowLeft size={18} aria-hidden /> All experiences
        </Back>
        <Hero>
          <Image src={experience.image} alt="" fill sizes="(max-width: 1100px) 100vw, 1100px" priority />
        </Hero>

        <Layout>
          <article>
            <Title>{experience.title}</Title>
            <Facts>
              <li>
                <MapPin size={18} aria-hidden /> {experience.location}
              </li>
              {experience.duration && (
                <li>
                  <Clock size={18} aria-hidden /> {DURATION_LABELS[experience.duration]}
                </li>
              )}
              {experience.timeOfDays.length > 0 && (
                <li>
                  <Sun size={18} aria-hidden /> {experience.timeOfDays.map((t) => TIME_OF_DAY_LABELS[t]).join(", ")}
                </li>
              )}
              <li>
                <Rating rating={experience.rating} count={experience.ratingCount} size="md" />
              </li>
            </Facts>

            {experience.description && <Description>{experience.description}</Description>}

            {details.length > 0 && (
              <>
                <SubHeading>Good to know</SubHeading>
                <Chips>
                  {details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </Chips>
              </>
            )}
          </article>

          <Aside aria-label="Price and host">
            <PriceLine>
              <strong>{formatPrice(experience.price)}</strong> per person
            </PriceLine>
            <Note>Online booking is coming soon.</Note>
            <HostRow>
              Hosted by{" "}
              <Link href={`/experiences?hostId=${encodeURIComponent(experience.host.id)}`}>
                {experience.host.name ?? "a local host"}
              </Link>
            </HostRow>
            {isOwner && (
              <OwnerActions>
                <LinkButton href={`/experiences/${encodeURIComponent(experience.id)}/edit`}>
                  <Pencil size={16} aria-hidden /> Edit
                </LinkButton>
                <DangerButton type="button" onClick={() => confirmRef.current?.showModal()}>
                  <Trash2 size={16} aria-hidden /> Delete
                </DangerButton>
              </OwnerActions>
            )}
          </Aside>
        </Layout>
      </Main>
      <AppFooter />

      {isOwner && (
        <Confirm ref={confirmRef} aria-labelledby="confirm-delete-title">
          <h2 id="confirm-delete-title">Delete this experience?</h2>
          <p>“{experience.title}” will be removed for everyone. This can&apos;t be undone.</p>
          {deleteError && <ErrorText role="alert">{deleteError}</ErrorText>}
          <div>
            <SecondaryButton type="button" onClick={() => confirmRef.current?.close()} disabled={deleting}>
              Keep it
            </SecondaryButton>
            <Button type="button" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </Confirm>
      )}
    </>
  );
}
