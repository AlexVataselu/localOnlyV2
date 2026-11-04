"use client";

import { type ComponentType, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgePercent,
  Clock,
  ExternalLink,
  Flame,
  MapPin,
  Pencil,
  RotateCcw,
  Sparkles,
  Star,
  Sun,
  Trash2,
  UserRound,
  Wallet,
  Zap,
} from "lucide-react";
import AppFooter from "@/components/AppFooter";
import ExperienceCard from "@/components/ExperienceCard";
import Carousel from "@/components/ui/Carousel";
import Rating from "@/components/ui/Rating";
import SiteHeader from "@/components/ui/SiteHeader";
import { Button, SecondaryButton } from "@/components/ui/Status";
import { ClientApiError, request } from "@/lib/api/client";
import { mascotFor, portraitFor } from "@/lib/mascots";
import type { Experience, HostProfile } from "@/types/experience";
import {
  ACTIVITY_TYPE_LABELS,
  DURATION_LABELS,
  type Special,
  SPECIAL_LABELS,
  TIME_OF_DAY_LABELS,
} from "@/types/filters";
import { formatPrice, formatRating, pluralize } from "@/utils/formatters";

/* ---------- layout ---------- */

const Main = styled.main`
  max-width: 1180px;
  margin: 0 auto;
  padding: 1.25rem clamp(16px, 5vw, 80px) 0;
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

const TitleBlock = styled.header`
  margin: 0.5rem 0 1.25rem;

  h1 {
    margin: 0 0 0.6rem;
    font-family: var(--font-display), sans-serif;
    font-weight: 900;
    font-size: clamp(1.9rem, 4vw, 2.9rem);
    line-height: 1.08;
    text-wrap: balance;
  }
`;

const Meta = styled.ul`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
  color: ${({ theme }) => theme.colors.textSecondary};

  li {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  a {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 600;
  }
`;

const Hero = styled.div`
  position: relative;
  aspect-ratio: 21 / 9;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};

  img {
    object-fit: cover;
  }

  @media (max-width: 720px) {
    aspect-ratio: 4 / 3;
    border-radius: 16px;
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: clamp(1.5rem, 4vw, 3.5rem);
  align-items: start;
  margin-top: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Block = styled.section`
  padding: 2rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  &:first-child {
    border-top: none;
    padding-top: 0;
  }

  h2 {
    margin: 0 0 1rem;
    font-family: var(--font-display), sans-serif;
    font-weight: 900;
    font-size: clamp(1.3rem, 2.2vw, 1.6rem);
  }
`;

/* ---------- quick facts ---------- */

const Facts = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 1rem;
    border-radius: 16px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }

  svg {
    color: ${({ theme }) => theme.colors.accentText};
  }

  span {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

/* ---------- text ---------- */

const Description = styled.p`
  margin: 0;
  max-width: 68ch;
  font-size: 1.1rem;
  line-height: 1.7;
  white-space: pre-line;
`;

const Muted = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Chips = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.25rem 0 0;
  padding: 0;
  list-style: none;

  li {
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    font-size: 0.9rem;
    font-weight: 600;
  }
`;

/* ---------- good to know ---------- */

const KnowGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem 2rem;
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 0.75rem;
  }

  svg {
    color: ${({ theme }) => theme.colors.accentText};
    margin-top: 2px;
  }

  strong {
    display: block;
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.95rem;
  }
`;

const SPECIAL_INFO: Record<Special, { icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>; text: string }> = {
  FREE_CANCELLATION: { icon: RotateCcw, text: "The host offers free cancellation for this experience." },
  PRIVATE_TOUR: { icon: UserRound, text: "Just your group and the host." },
  LIKELY_TO_SELL_OUT: { icon: Flame, text: "Popular with guests. Places go quickly." },
  SKIP_THE_LINE: { icon: Zap, text: "Skip the queue at the entrance." },
  DEALS_AND_DISCOUNTS: { icon: BadgePercent, text: "The host currently has a deal on this experience." },
  NEW_EXPERIENCE: { icon: Sparkles, text: "Recently added to Locals Only." },
};

/* ---------- host ---------- */

const HostCard = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1.25rem;
  align-items: start;
  padding: 1.25rem;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};

  @media (max-width: 520px) {
    grid-template-columns: 88px 1fr;
  }
`;

const HostPortrait = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};

  img {
    object-fit: cover;
    object-position: 50% 20%;
  }
`;

const HostName = styled.p`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
`;

const Persona = styled.p`
  margin: 0.15rem 0 0.6rem;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accentText};
`;

const HostStats = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.25rem;
  margin: 0.75rem 0;
  padding: 0;
  list-style: none;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  li {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
`;

const TextLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accentText};
  text-underline-offset: 4px;
`;

/* ---------- map ---------- */

const MapFrame = styled.div`
  position: relative;
  aspect-ratio: 16 / 7;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    filter: ${({ theme }) => (theme.mode === "dark" ? "invert(0.9) hue-rotate(180deg) saturate(0.6)" : "none")};
  }

  @media (max-width: 720px) {
    aspect-ratio: 4 / 3;
  }
`;

const ExternalA = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 44px;
  margin-top: 0.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accentText};
  text-underline-offset: 4px;
`;

/* ---------- reviews ---------- */

const ReviewSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;

  .score {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-display), sans-serif;
    font-size: 2.6rem;
    font-weight: 900;
    line-height: 1;
  }

  svg {
    color: ${({ theme }) => theme.colors.star};
  }
`;

/* ---------- booking card ---------- */

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
  box-shadow: ${({ theme }) => theme.shadows.cardHover};

  @media (max-width: 900px) {
    position: static;
    order: -1;
  }
`;

const PriceLine = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    font-size: 1.9rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const AsideList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0;
  padding: 1rem 0 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  list-style: none;
  font-size: 0.95rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  svg {
    color: ${({ theme }) => theme.colors.accentText};
  }
`;

const SoonButton = styled(Button)`
  width: 100%;
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

/* ---------- component ---------- */

interface ExperienceDetailProps {
  experience: Experience;
  host: HostProfile | null;
  moreFromHost: Experience[];
  similar: Experience[];
}

export default function ExperienceDetail({ experience, host, moreFromHost, similar }: ExperienceDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const confirmRef = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isOwner = session?.user?.id === experience.host.id && session?.user?.role === "HOST";
  const hostName = experience.host.name ?? "your host";
  const firstName = hostName.split(" ")[0];
  const mascot = mascotFor(experience.host);
  const hostLink = `/experiences?hostId=${encodeURIComponent(experience.host.id)}`;
  const mapQuery = encodeURIComponent(`${experience.location}, Romania`);

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

  return (
    <>
      <SiteHeader />
      <Main id="main">
        <Back href="/experiences">
          <ArrowLeft size={18} aria-hidden /> All experiences
        </Back>

        <TitleBlock>
          <h1>{experience.title}</h1>
          <Meta>
            <li>
              <Rating rating={experience.rating} count={experience.ratingCount} size="md" />
            </li>
            <li>
              <MapPin size={18} aria-hidden /> {experience.location}
            </li>
            <li>
              Hosted by <Link href={hostLink}>{hostName}</Link>
            </li>
          </Meta>
        </TitleBlock>

        <Hero>
          <Image src={experience.image} alt="" fill sizes="(max-width: 1180px) 100vw, 1180px" priority />
        </Hero>

        <Layout>
          <article>
            <Block aria-label="At a glance">
              <Facts>
                <li>
                  <Clock size={20} aria-hidden />
                  <span>Duration</span>
                  <strong>{experience.duration ? DURATION_LABELS[experience.duration] : "Not specified"}</strong>
                </li>
                <li>
                  <Sun size={20} aria-hidden />
                  <span>Time of day</span>
                  <strong>
                    {experience.timeOfDays.length
                      ? experience.timeOfDays.map((t) => TIME_OF_DAY_LABELS[t]).join(", ")
                      : "Flexible"}
                  </strong>
                </li>
                <li>
                  <Wallet size={20} aria-hidden />
                  <span>Price</span>
                  <strong>{formatPrice(experience.price)} / person</strong>
                </li>
                <li>
                  <UserRound size={20} aria-hidden />
                  <span>Your host</span>
                  <strong>{hostName}</strong>
                </li>
              </Facts>
            </Block>

            <Block aria-labelledby="what-title">
              <h2 id="what-title">What you&apos;ll do</h2>
              {experience.description ? (
                <Description>{experience.description}</Description>
              ) : (
                <Muted>The host hasn&apos;t written a description yet.</Muted>
              )}
              {experience.activityTypes.length > 0 && (
                <Chips aria-label="Activity types">
                  {experience.activityTypes.map((t) => (
                    <li key={t}>{ACTIVITY_TYPE_LABELS[t]}</li>
                  ))}
                </Chips>
              )}
            </Block>

            {experience.specials.length > 0 && (
              <Block aria-labelledby="know-title">
                <h2 id="know-title">Good to know</h2>
                <KnowGrid>
                  {experience.specials.map((s) => {
                    const { icon: Icon, text } = SPECIAL_INFO[s];
                    return (
                      <li key={s}>
                        <Icon size={22} aria-hidden />
                        <div>
                          <strong>{SPECIAL_LABELS[s]}</strong>
                          <span>{text}</span>
                        </div>
                      </li>
                    );
                  })}
                </KnowGrid>
              </Block>
            )}

            <Block aria-labelledby="host-title">
              <h2 id="host-title">Meet your host</h2>
              <HostCard>
                <HostPortrait>
                  <Image src={portraitFor(experience.host)} alt="" fill sizes="120px" />
                </HostPortrait>
                <div>
                  <HostName>{hostName}</HostName>
                  <Persona>{mascot.name}</Persona>
                  {host?.bio && <Muted>{host.bio}</Muted>}
                  {host && (
                    <HostStats>
                      <li>{pluralize(host.experienceCount, "experience", "experiences")}</li>
                      {host.rating !== null && (
                        <li>
                          <Star size={15} fill="currentColor" aria-hidden /> {formatRating(host.rating)} across{" "}
                          {pluralize(host.ratingCount, "review", "reviews")}
                        </li>
                      )}
                      {host.locations.length > 0 && <li>{host.locations.slice(0, 2).join(" · ")}</li>}
                    </HostStats>
                  )}
                  <TextLink href={hostLink}>Everything {firstName} hosts</TextLink>
                </div>
              </HostCard>
            </Block>

            <Block aria-labelledby="where-title">
              <h2 id="where-title">Where you&apos;ll be</h2>
              <Muted style={{ marginBottom: "1rem" }}>{experience.location}. The host shares the exact meeting point with guests.</Muted>
              <MapFrame>
                <iframe
                  title={`Map of ${experience.location}`}
                  src={`https://www.google.com/maps?q=${mapQuery}&z=11&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </MapFrame>
              <ExternalA href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">
                Open in Google Maps <ExternalLink size={16} aria-hidden />
              </ExternalA>
            </Block>

            <Block aria-labelledby="reviews-title">
              <h2 id="reviews-title">Reviews</h2>
              {experience.rating !== null && experience.ratingCount > 0 ? (
                <ReviewSummary>
                  <span className="score">
                    <Star size={32} fill="currentColor" aria-hidden /> {formatRating(experience.rating)}
                  </span>
                  <Muted>
                    Average from {pluralize(experience.ratingCount, "guest review", "guest reviews")}. Written reviews are
                    coming to Locals Only soon.
                  </Muted>
                </ReviewSummary>
              ) : (
                <Muted>No reviews yet. This experience is new to Locals Only.</Muted>
              )}
            </Block>
          </article>

          <Aside aria-label="Price and booking">
            <PriceLine>
              <strong>{formatPrice(experience.price)}</strong> per person
            </PriceLine>
            <SoonButton type="button" disabled aria-describedby="booking-note">
              Booking opens soon
            </SoonButton>
            <Muted id="booking-note">Online booking is coming to Locals Only. Save this page and check back.</Muted>
            <AsideList>
              {experience.duration && (
                <li>
                  <Clock size={18} aria-hidden /> {DURATION_LABELS[experience.duration]}
                </li>
              )}
              <li>
                <MapPin size={18} aria-hidden /> {experience.location}
              </li>
              {experience.specials.includes("FREE_CANCELLATION") && (
                <li>
                  <RotateCcw size={18} aria-hidden /> Free cancellation
                </li>
              )}
            </AsideList>
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

        {moreFromHost.length > 0 && (
          <Carousel flush headingId="more-host-title" title={`More from ${firstName}`} label={`more from ${firstName}`}>
            {moreFromHost.map((e) => (
              <ExperienceCard key={e.id} experience={e} />
            ))}
          </Carousel>
        )}

        {similar.length > 0 && (
          <Carousel flush headingId="similar-title" title="Similar experiences" label="similar experiences">
            {similar.map((e) => (
              <ExperienceCard key={e.id} experience={e} />
            ))}
          </Carousel>
        )}
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
