"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import styled from "styled-components";
import ExperienceExtrasFields from "@/components/ExperienceExtrasFields";
import {
  Share2, Heart, ChevronLeft, ChevronRight, ChevronDown, X, Grip, Plus, Trash2, Star, Radar, CircleCheck,
  CupSoda, Utensils, Bus, Backpack, Tent, Check, type LucideIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { formatPriceWithUnit } from "@/utils/formatters";
import {
  ACTIVITY_TYPES,
  TIME_OF_DAYS,
  DURATIONS,
  SPECIALS,
  ActivityType,
  TimeOfDay,
  Duration,
  Special,
} from "@/types/filters";
import type { Experience, ExperienceExtras, ExperienceReview } from "@/types/experience";
import ChallengeBadgeCard from "@/components/home/ChallengeBadgeCard";
import ExperienceCard from "@/components/ExperienceCard";

// ---------- Layout ----------
/** Full-width hero: title, stars, location, share, save, photo gallery */
const HeroSection = styled.section`
  width: 100%;
  padding: 2rem clamp(24px, 5vw, 80px) 40px;
`;

/** Edit mode keeps the two-column form + price card. */
const PageWrapper = styled.div`
  width: 100%;
  padding: 1.5rem clamp(24px, 5vw, 80px) 4rem;
  display: flex;
  gap: 3rem;
  align-items: flex-start;

  @media (max-width: 1100px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ContentWrap = styled.div`
  width: 100%;
  padding: 0 clamp(24px, 5vw, 80px) 4rem;
`;

/** About the experience on the left, booking card on the right, aligned to the bottom as in the design. */
const TopRow = styled.div`
  display: flex;
  gap: 40px;
  align-items: flex-end;
  padding: 40px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 1100px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const MainCol = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 100%;
`;

const BookingCol = styled.aside`
  width: 300px;
  flex-shrink: 0;

  @media (max-width: 1100px) {
    width: 100%;
    max-width: 420px;
    /* On phones, show price and booking right after the photos, not five screens down. */
    order: -1;
  }
`;

const IncludedBlock = styled.div`
  margin-top: 40px;
`;

const SimilarSection = styled.section`
  padding-top: 40px;
`;

// ---------- Hero & Gallery ----------
const HeroHeader = styled.header`
  border-radius: 16px;
  margin-bottom: 2rem;
`;

const HeroTitle = styled.h1`
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const HeroSecondLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const HeroMetaLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const HeroRatingBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const HeroStar = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1.1rem;
`;

const HeroLocationText = styled.span`
  font-size: 1rem;
  font-weight: 700;
  margin-left: 2.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const HeroActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
`;

const HeaderActionBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.95rem;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

/** 5-image gallery: [1 tall][2 tall][3 top, 4 bottom][5 tall with "Show all" button] — matches design */
const HeroWrap = styled.div`
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
  aspect-ratio: 1360/409;
  min-height: 240px;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(5, 1fr);
    aspect-ratio: auto;
    min-height: 320px;
  }
`;

const HeroGalleryCell = styled.div<{ $col: number; $row?: number; $spanRows?: boolean }>`
  position: relative;
  min-height: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  grid-column: ${(p) => p.$col};
  grid-row: ${(p) => (p.$spanRows ? "1 / -1" : String(p.$row ?? 1))};

  @media (max-width: 768px) {
    grid-column: 1;
    grid-row: auto;
  }
`;

const ShowAllPhotos = styled.button`
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #222;
  background: #fff;
  color: #222;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover { background: #f2f2f2; }
`;

// ---------- Photo Gallery Modal ----------
const PhotoModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.96);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PhotoModalCloseBtn = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const PhotoModalNavBtn = styled.button<{ $side: "left" | "right" }>`
  position: absolute;
  ${({ $side }) => ($side === "left" ? "left: 20px;" : "right: 20px;")}
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const PhotoModalInner = styled.div`
  position: relative;
  width: min(90vw, 1200px);
  height: min(85vh, 900px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PhotoModalCounter = styled.div`
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
`;

// ---------- Section shell (design: 40px vertical rhythm, a rule under each section) ----------
const Section = styled.section`
  padding: 40px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;
const SectionTitle = styled.h2`
  font-size: 1.375rem;
  font-weight: 900;
  line-height: 1.2;
  margin: 0 0 10px 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 20px;

  ${SectionTitle} { margin: 0; }
`;
/** Large body copy used by "What we will do", the host bio and the map description. */
const BodyText = styled.p`
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow-wrap: anywhere;

  @media (max-width: 720px) { font-size: 1.0625rem; }
`;

// ---------- Hosted by + What we will do ----------
const HostIntro = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 40px;
`;
const HostIntroTitle = styled.p`
  margin: 0 0 10px 0;
  font-size: 1.375rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const HostIntroMeta = styled.p`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const Avatar = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 900;
  font-size: ${({ $size }) => Math.round($size / 2.6)}px;

  img { width: 100%; height: 100%; object-fit: cover; }
`;
const ReadMore = styled.button`
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  font-weight: 900;
  cursor: pointer;

  &:hover { text-decoration: underline; }
`;

// ---------- Slider nav: the design's pill (prev blank half, next accent half) ----------
const PillNav = styled.div<{ $variant: "round" | "square" }>`
  display: inline-flex;
  flex-shrink: 0;
  overflow: hidden;
  border: ${({ $variant }) => ($variant === "round" ? 3 : 1)}px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ $variant }) => ($variant === "round" ? 20 : 10)}px;
`;
const PillNavBtn = styled.button<{ $next?: boolean }>`
  width: 48px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${({ $next, theme }) => ($next ? theme.colors.accent : theme.colors.cardBackground)};
  color: ${({ $next, theme }) => ($next ? theme.colors.onAccent : theme.colors.textPrimary)};

  &:disabled { cursor: not-allowed; }
  &:disabled svg { opacity: 0.35; }
`;

// ---------- What's included ----------
const IncludedTrack = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  /* Room for the card shadow, which overflow would clip. */
  padding: 0 6px 6px 0;

  &::-webkit-scrollbar { display: none; }
`;
const IncludedCard = styled.div`
  flex: 0 0 150px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.onPanel};
  filter: drop-shadow(4px 4px 2px rgba(0, 0, 0, 0.25));
`;
const IncludedHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const IncludedTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 500;
`;
const IncludedList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.875rem;
`;

// ---------- Booking card ----------
const BookingCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 25px 20px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.panel};
  color: ${({ theme }) => theme.colors.onPanel};
  filter: drop-shadow(4px 4px 2px rgba(0, 0, 0, 0.25));
`;
const PriceLead = styled.p`
  margin: 0;
  font-size: 1.375rem;
  font-weight: 900;
`;
const PriceUnit = styled.span`
  font-size: 1rem;
  font-weight: 400;
`;
const BookingFields = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
const BookingField = styled.label<{ $side: "left" | "right" }>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  padding: 8px 32px 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.panelLine};
  border-radius: ${({ $side }) => ($side === "left" ? "10px 0 0 10px" : "0 10px 10px 0")};
  ${({ $side }) => ($side === "right" ? "border-left: none;" : "")}
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;

  &:focus-within { outline: 2px solid ${({ theme }) => theme.colors.accent}; outline-offset: -2px; }
`;
const BookingSelect = styled.select`
  appearance: none;
  width: 100%;
  min-width: 0;
  border: none;
  padding: 0;
  text-overflow: ellipsis;
  background: transparent;
  color: ${({ theme }) => theme.colors.panelMuted};
  font-size: 0.75rem;
  font-weight: 300;
  cursor: pointer;
  outline: none;

  option { color: #1f1f1f; }
`;
const BookingChevron = styled(ChevronDown)`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
`;
const SlotRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.panelLine};
`;
const SlotDate = styled.p`
  margin: 0 0 10px 0;
  font-size: 0.875rem;
`;
const SlotTime = styled.p`
  margin: 0;
  font-size: 0.75rem;
`;
const SlotSide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  flex-shrink: 0;
`;
const SlotPrice = styled.p`
  margin: 0;
  font-size: 0.875rem;
  white-space: nowrap;

  span { font-size: 0.75rem; color: ${({ theme }) => theme.colors.panelMuted}; }
`;
const ChooseBtn = styled.button`
  padding: 8px 20px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-size: 0.875rem;
  font-weight: 900;
  cursor: pointer;

  &:hover { background: ${({ theme }) => theme.colors.accentHover}; }
`;
const MoreDatesBtn = styled.button`
  width: 100%;
  padding: 8px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.panelLine};
  background: ${({ theme }) => theme.colors.onPanel};
  color: ${({ theme }) => theme.colors.panel};
  font-size: 0.875rem;
  font-weight: 900;
  cursor: pointer;
`;
const NoDates = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.panelMuted};
`;

// ---------- Meet the host ----------
const HostCard = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
`;
const HostCardText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textPrimary};

  p { margin: 0; }
`;
const HostCardName = styled.h2`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const IconLine = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;
const HostActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
  flex-wrap: wrap;
  margin-top: 40px;
`;
const ContactHostBtn = styled.button`
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-size: 1.25rem;
  font-weight: 900;
  cursor: pointer;

  &:hover { background: ${({ theme }) => theme.colors.accentHover}; }
`;
const SafetyNote = styled.p`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  max-width: 440px;
  font-size: 0.875rem;
  line-height: 1.1;
  color: ${({ theme }) => theme.colors.textPrimary};

  svg { flex-shrink: 0; }
  a { font-weight: 900; color: inherit; text-decoration: none; }
  a:hover { text-decoration: underline; }
`;
const EditLink = styled.button`
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.accentText};
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
`;

// ---------- Where you'll be ----------
const MapFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  margin: 20px 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  @media (max-width: 720px) { aspect-ratio: 4 / 3; }
`;
const MapLink = styled.p`
  margin: 1rem 0 0 0;
  font-size: 0.95rem;
  a { color: ${({ theme }) => theme.colors.accentText}; }
`;

// ---------- Things to know ----------
const ThingsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 371px) auto minmax(0, 1fr);
  gap: 40px;
  margin-top: 20px;

  @media (max-width: 900px) { grid-template-columns: 1fr; gap: 28px; }
`;
const ThingsCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const ThingsTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const ThingsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.875rem;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.textPrimary};

  li { display: flex; align-items: flex-start; gap: 5px; }
  svg { flex-shrink: 0; margin-top: 2px; }
`;
const PolicyText = styled.p`
  margin: 0;
  max-width: 366px;
  font-size: 0.875rem;
  line-height: 1.3;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

// ---------- Sliders (Badges, Reviews, Similar) ----------
const SliderTrack = styled.div`
  overflow: hidden;
`;
/* Every similar card stretches to the tallest one, so the row lines up. */
const SimilarSlot = styled.div`
  flex: 0 0 280px;
  display: flex;

  & > * {
    flex: 1;
  }
`;
const SliderList = styled.div<{ $offset: number; $gap?: number }>`
  display: flex;
  gap: ${({ $gap }) => $gap ?? 16}px;
  transform: translateX(${({ $offset }) => $offset}px);
  transition: transform 0.3s ease;
`;
/** "Similar experiences": big title under an accent rule that curls at the right end. */
const AccentTitle = styled.h2`
  margin: 0;
  padding: 20px 20px 0 0;
  border-top: 5px solid ${({ theme }) => theme.colors.accent};
  border-top-right-radius: 20px;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 900;
  line-height: 1;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

// ---------- Reviews ----------
const ReviewsTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;

  h2 { font-size: 1.5rem; margin: 0; }
`;
const TextNav = styled.div`
  display: flex;
  gap: 12px;
  padding-right: 20px;
`;
const TextNavBtn = styled.button<{ $next?: boolean }>`
  padding: 4px 0;
  border: none;
  background: none;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  color: ${({ $next, theme }) => ($next ? theme.colors.accentText : theme.colors.textSecondary)};

  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;
const ReviewCard = styled.article`
  flex-shrink: 0;
  width: 330px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.panelLine};
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 420px) { width: 280px; }
`;
const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;
const ReviewMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.875rem;
`;
const ReviewName = styled.h3`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 900;
`;
const ReviewText = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.3;
`;

// ---------- Edit (existing) ----------
const EditSection = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
`;
const Field = styled.div` margin-bottom: 1.5rem; `;
const Label = styled.label`
  display: block;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
`;
const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  width: 100%;
  box-sizing: border-box;
`;
const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
`;
const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
`;
const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.accent};
`;
const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
`;
const RadioContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
`;
const RadioInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.accent};
`;
const EditActions = styled.div` display: flex; gap: 1rem; margin-top: 1rem; `;
const SaveButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  &:hover { background: ${({ theme }) => theme.colors.accentHover}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;
const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  font-size: 0.9rem;
  &:hover { background: ${({ theme }) => theme.colors.surface}; }
`;

// ---------- Per-listing details ----------
// Everything below the description comes from the experience record; a section with no data is hidden.

const INCLUDED_ICONS: Array<[RegExp, LucideIcon]> = [
  [/drink|water|coffee|tea|wine/i, CupSoda],
  [/food|meal|lunch|snack|tasting/i, Utensils],
  [/transport|transfer|shuttle|pick/i, Bus],
  [/gear|equipment|bike|kayak|helmet/i, Backpack],
  [/rest|cabin|stay|accommodation|lodg/i, Tent],
];
const includedIcon = (title: string): LucideIcon => INCLUDED_ICONS.find(([re]) => re.test(title))?.[1] ?? Check;
const initialOf = (name?: string | null) => (name?.trim()[0] ?? "?").toUpperCase();
/** Booking slots shown before "Show more dates". */
const SLOTS_SHOWN = 3;

/** Badges a guest can work towards, by activity type. None are "completed": there is no progress tracking yet. */
const BADGES_BY_ACTIVITY: Record<string, Array<{ id: string; title: string; description: string; icon: string }>> = {
  "Nature and Outdoors": [
    { id: "orienteering", title: "Orienteering", description: "Adaptability, quick decision-making in varying terrain.", icon: "🧭" },
    { id: "foraging", title: "Foraging", description: "Knowledge of the environment and identifying plants and fungi.", icon: "🫐" },
  ],
  Sports: [
    { id: "mountain-biking", title: "Mountain Biking", description: "Technical skills, balance, and trail awareness.", icon: "🚴" },
    { id: "trail-running", title: "Trail Running", description: "Endurance and agility on varied, technical terrain.", icon: "🏃" },
  ],
  "Food and drink": [{ id: "honey-hunter", title: "Honey Hunter", description: "Find local flavours and the people who make them.", icon: "🍯" }],
  Wellness: [{ id: "bird-watching", title: "Bird Watching", description: "Patience, attention to detail, and knowledge of local species.", icon: "🐦" }],
};

// ---------- Edit form: multi-image ----------
const ImageRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;
const ImageInputEdit = styled(Input)`
  flex: 1;
`;
const RemoveImageBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s, border-color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors.accent}; border-color: ${({ theme }) => theme.colors.accent}; }
`;
const AddImageBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  &:hover { border-color: ${({ theme }) => theme.colors.accent}; color: ${({ theme }) => theme.colors.accent}; }
`;

// ---------- Props ----------
/** The editable per-listing details of an experience, with empty defaults. */
const extrasOf = (e: Partial<ExperienceExtras>): ExperienceExtras => ({
  included: e.included ?? [],
  toBring: e.toBring ?? [],
  guestRequirements: e.guestRequirements ?? [],
  cancellationPolicy: e.cancellationPolicy ?? null,
  languages: e.languages ?? [],
  whereDescription: e.whereDescription ?? null,
  availability: e.availability ?? [],
});

type ExperienceDetailProps = {
  experience: {
    id: string;
    title: string;
    location: string;
    price: number;
    rating: number;
    image: string;
    images?: string[] | null;
    description?: string | null;
    hostName?: string | null;
    hostImage?: string | null;
    activityTypes?: ActivityType[];
    timeOfDays?: TimeOfDay[];
    duration?: Duration | null;
    specials?: Special[];
    hostBio?: string | null;
    hostSince?: number | null;
    reviewCount?: number;
    reviews?: ExperienceReview[];
  } & Partial<ExperienceExtras>;
};

export default function ExperienceDetailContent({ experience }: ExperienceDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(experience.title);
  const [location, setLocation] = useState(experience.location);
  const [price, setPrice] = useState(experience.price.toString());
  const [images, setImages] = useState<string[]>(() =>
    (experience.images?.length ? experience.images : experience.image ? [experience.image] : [])
  );
  const [description, setDescription] = useState(experience.description || "");
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>(experience.activityTypes || []);
  const [timeOfDays, setTimeOfDays] = useState<TimeOfDay[]>(experience.timeOfDays || []);
  const [duration, setDuration] = useState<Duration | null>(experience.duration || null);
  const [specials, setSpecials] = useState<Special[]>(experience.specials || []);
  const [extras, setExtras] = useState<ExperienceExtras>(() => extrasOf(experience));
  const [saved, setSaved] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [readMore, setReadMore] = useState(false);
  const [badgeOffset, setBadgeOffset] = useState(0);
  const [reviewOffset, setReviewOffset] = useState(0);
  const [similarOffset, setSimilarOffset] = useState(0);
  const [similar, setSimilar] = useState<Experience[]>([]);
  const [showAllDates, setShowAllDates] = useState(false);
  const includedRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const similarRef = useRef<HTMLDivElement>(null);

  const isHost = session?.user?.role === "HOST";
  const reviewCount = experience.reviewCount ?? experience.reviews?.length ?? 0;
  const reviews = experience.reviews ?? [];
  const included = experience.included ?? [];
  const toBring = experience.toBring ?? [];
  const guestRequirements = experience.guestRequirements ?? [];
  const availability = experience.availability ?? [];
  const languages = experience.languages ?? [];
  const badges = Array.from(
    new Map((experience.activityTypes ?? []).flatMap((t) => BADGES_BY_ACTIVITY[t] ?? []).map((b) => [b.id, b])).values(),
  );
  const visibleSlots = showAllDates ? availability : availability.slice(0, SLOTS_SHOWN);
  const metaLine = [experience.duration, languages.length ? `Hosted in ${languages.join(" and ")}` : null].filter(Boolean).join(" - ");
  const scrollIncluded = (dir: 1 | -1) => includedRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  const mapQuery = encodeURIComponent(`${experience.location}, Romania`);
  const descShort = 280;
  const needReadMore = (experience.description?.length ?? 0) > descShort;
  const descToShow = readMore || !needReadMore ? (experience.description ?? "") : (experience.description ?? "").slice(0, descShort) + "…";

  // Gallery: 5 images for design. Reuse first image when fewer than 5.
  const rawGallery = experience.images?.length ? experience.images : (experience.image ? [experience.image] : []);
  const galleryImages = rawGallery.length ? rawGallery : [experience.image || ""];
  const fallback = galleryImages[0] || experience.image || "";
  const imgFive: string[] = [];
  for (let i = 0; i < 5; i++) imgFive.push(galleryImages[i] ?? imgFive[i - 1] ?? fallback);

  useEffect(() => {
    fetch("/api/experiences?limit=8")
      .then((r) => r.json())
      .then((d: { items?: unknown[] }) => {
        const list = (d?.items ?? []) as Experience[];
        setSimilar(list.filter((e) => e.id !== experience.id).slice(0, 6));
      })
      .catch(() => {});
  }, [experience.id]);

  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.put(`/experiences/${experience.id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiences"] });
      queryClient.invalidateQueries({ queryKey: ["experience", experience.id] });
      setIsEditing(false);
      router.refresh();
    },
  });

  const handleSave = useCallback(() => {
    const imagesTrimmed = images.map((u) => u.trim()).filter(Boolean);
    updateMutation.mutate({
      title: title.trim(),
      location: location.trim(),
      price: Number(price),
      images: imagesTrimmed.length > 0 ? imagesTrimmed : [experience.image],
      description: description.trim() || undefined,
      activityTypes: activityTypes.length ? activityTypes : [],
      timeOfDays: timeOfDays.length ? timeOfDays : [],
      duration: duration || null,
      specials: specials.length ? specials : [],
      ...extras,
    });
  }, [title, location, price, images, description, activityTypes, timeOfDays, duration, specials, extras, updateMutation, experience.image]);

  const handleCancel = useCallback(() => {
    setTitle(experience.title);
    setLocation(experience.location);
    setPrice(experience.price.toString());
    setImages(experience.images?.length ? experience.images : experience.image ? [experience.image] : []);
    setDescription(experience.description || "");
    setActivityTypes(experience.activityTypes || []);
    setTimeOfDays(experience.timeOfDays || []);
    setDuration(experience.duration || null);
    setSpecials(experience.specials || []);
    setExtras(extrasOf(experience));
    setIsEditing(false);
  }, [experience]);

  useEffect(() => {
    if (!isEditing) {
      // Reset the edit form to the saved values whenever the experience changes outside edit mode.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(experience.title);
      setLocation(experience.location);
      setPrice(experience.price.toString());
      setImages(experience.images?.length ? experience.images : experience.image ? [experience.image] : []);
      setDescription(experience.description || "");
      setActivityTypes(experience.activityTypes || []);
      setTimeOfDays(experience.timeOfDays || []);
      setDuration(experience.duration || null);
      setSpecials(experience.specials || []);
      setExtras(extrasOf(experience));
    }
  }, [experience, isEditing]);

  const handleActivityTypeToggle = useCallback((t: ActivityType) => {
    setActivityTypes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  }, []);
  const handleTimeOfDayToggle = useCallback((t: TimeOfDay) => {
    setTimeOfDays((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));
  }, []);
  const handleDurationChange = useCallback((d: Duration) => {
    setDuration((p) => (p === d ? null : d));
  }, []);
  const handleSpecialToggle = useCallback((s: Special) => {
    setSpecials((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }, []);

  const addImageUrl = useCallback(() => setImages((p) => [...p, ""]), []);
  const removeImageUrl = useCallback((i: number) => setImages((p) => (p.length <= 1 ? p : p.filter((_, j) => j !== i))), []);
  const setImageUrlAt = useCallback((i: number, v: string) => setImages((p) => p.map((s, j) => (j === i ? v : s))), []);

  const slide = (ref: React.RefObject<HTMLDivElement | null>, set: React.Dispatch<React.SetStateAction<number>>, delta: number, cardWidth: number) => {
    const w = ref.current?.clientWidth ?? 400;
    const max = ref.current ? Math.max(0, (ref.current.scrollWidth - w)) : 0;
    set((o) => Math.max(-max, Math.min(0, o + delta * cardWidth)));
  };

  const handleShare = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = experience.title;
    const text = `${experience.title} – ${experience.location}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title, text, url }).catch(() => {
        navigator.clipboard?.writeText(url);
      });
    } else {
      navigator.clipboard?.writeText(url);
    }
  }, [experience.title, experience.location]);

  useEffect(() => {
    if (!photoModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhotoModalOpen(false);
      if (e.key === "ArrowLeft") setPhotoIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setPhotoIndex((i) => Math.min(galleryImages.length - 1, i + 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [photoModalOpen, galleryImages.length]);

  useEffect(() => {
    if (photoModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [photoModalOpen]);

  const CARD = 280;
  const REVIEW_CARD = 330 + 20;

  if (isEditing && isHost) {
    return (
      <PageWrapper>
        <MainCol>
          <EditSection>
            <SectionTitle>Edit Experience</SectionTitle>
            <Field>
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={updateMutation.isPending} />
            </Field>
            <Field>
              <Label htmlFor="edit-location">Location</Label>
              <Input id="edit-location" value={location} onChange={(e) => setLocation(e.target.value)} disabled={updateMutation.isPending} />
            </Field>
            <Field>
              <Label htmlFor="edit-price">Price</Label>
              <Input id="edit-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} disabled={updateMutation.isPending} />
            </Field>
            <Field>
              <Label>Gallery images (URLs)</Label>
              {images.map((url, i) => (
                <ImageRow key={i} style={{ marginTop: i > 0 ? "0.5rem" : 0 }}>
                  <ImageInputEdit type="url" placeholder={i === 0 ? "https://... (first is cover)" : "https://..."} value={url} onChange={(e) => setImageUrlAt(i, e.target.value)} disabled={updateMutation.isPending} />
                  <RemoveImageBtn type="button" onClick={() => removeImageUrl(i)} disabled={updateMutation.isPending} aria-label="Remove image">
                    <Trash2 size={18} />
                  </RemoveImageBtn>
                </ImageRow>
              ))}
              <AddImageBtn type="button" onClick={addImageUrl} disabled={updateMutation.isPending}>
                <Plus size={18} /> Add image URL
              </AddImageBtn>
            </Field>
            <Field>
              <Label htmlFor="edit-desc">Description</Label>
              <TextArea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} disabled={updateMutation.isPending} placeholder="Describe the experience" />
            </Field>
            <Field>
              <Label>Activity Type</Label>
              <CheckboxGroup>
                {ACTIVITY_TYPES.map((t) => (
                  <CheckboxContainer key={t}>
                    <CheckboxInput type="checkbox" checked={activityTypes.includes(t)} onChange={() => handleActivityTypeToggle(t)} disabled={updateMutation.isPending} />
                    <span>{t}</span>
                  </CheckboxContainer>
                ))}
              </CheckboxGroup>
            </Field>
            <Field>
              <Label>Time of Day</Label>
              <CheckboxGroup>
                {TIME_OF_DAYS.map((t) => (
                  <CheckboxContainer key={t}>
                    <CheckboxInput type="checkbox" checked={timeOfDays.includes(t)} onChange={() => handleTimeOfDayToggle(t)} disabled={updateMutation.isPending} />
                    <span>{t}</span>
                  </CheckboxContainer>
                ))}
              </CheckboxGroup>
            </Field>
            <Field>
              <Label>Duration</Label>
              <RadioGroup>
                {DURATIONS.map((d) => (
                  <RadioContainer key={d}>
                    <RadioInput type="radio" name="dur" checked={duration === d} onChange={() => handleDurationChange(d)} disabled={updateMutation.isPending} />
                    <span>{d}</span>
                  </RadioContainer>
                ))}
              </RadioGroup>
            </Field>
            <Field>
              <Label>Specials</Label>
              <CheckboxGroup>
                {SPECIALS.map((s) => (
                  <CheckboxContainer key={s}>
                    <CheckboxInput type="checkbox" checked={specials.includes(s)} onChange={() => handleSpecialToggle(s)} disabled={updateMutation.isPending} />
                    <span>{s}</span>
                  </CheckboxContainer>
                ))}
              </CheckboxGroup>
            </Field>
            <ExperienceExtrasFields key={experience.id} value={extras} onChange={setExtras} disabled={updateMutation.isPending} />
            <EditActions>
              <SaveButton onClick={handleSave} disabled={updateMutation.isPending}>{updateMutation.isPending ? "Saving..." : "Save"}</SaveButton>
              <CancelButton onClick={handleCancel} disabled={updateMutation.isPending}>Cancel</CancelButton>
            </EditActions>
          </EditSection>
        </MainCol>
        <BookingCol>
          <BookingCard>
            <PriceLead>From {formatPriceWithUnit(experience.price, "Lei")} <PriceUnit>/ person</PriceUnit></PriceLead>
          </BookingCard>
        </BookingCol>
      </PageWrapper>
    );
  }

  return (
    <>
      {/* Full-width hero: title, stars, location, share, save, photo gallery */}
      <HeroSection>
        <HeroHeader>
          <HeroTitle>{experience.title}</HeroTitle>
          <HeroSecondLine>
            <HeroMetaLeft>
              <HeroRatingBadge>
                <HeroStar>★</HeroStar>
                {reviewCount > 0 ? `${experience.rating.toFixed(2)} (${reviewCount} ${reviewCount === 1 ? "Review" : "Reviews"})` : "New"}
              </HeroRatingBadge>
              <HeroLocationText>{experience.location}</HeroLocationText>
            </HeroMetaLeft>
            <HeroActionsRow>
              <HeaderActionBtn type="button" onClick={handleShare} aria-label="Share">
                <Share2 size={18} /> Share
              </HeaderActionBtn>
              <HeaderActionBtn type="button" onClick={() => setSaved((s) => !s)} aria-label="Save">
                <Heart size={18} fill={saved ? "currentColor" : "none"} /> Save
              </HeaderActionBtn>
            </HeroActionsRow>
          </HeroSecondLine>
        </HeroHeader>

        <HeroWrap>
          <HeroGalleryCell $col={1} $spanRows>
            <Image src={imgFive[0]} alt={experience.title} fill sizes="(max-width:768px) 100vw, 25vw" priority style={{ objectFit: "cover" }} />
          </HeroGalleryCell>
          <HeroGalleryCell $col={2} $spanRows>
            <Image src={imgFive[1]} alt="" fill sizes="(max-width:768px) 100vw, 25vw" style={{ objectFit: "cover" }} />
          </HeroGalleryCell>
          <HeroGalleryCell $col={3} $row={1}>
            <Image src={imgFive[2]} alt="" fill sizes="(max-width:768px) 100vw, 25vw" style={{ objectFit: "cover" }} />
          </HeroGalleryCell>
          <HeroGalleryCell $col={3} $row={2}>
            <Image src={imgFive[3]} alt="" fill sizes="(max-width:768px) 100vw, 25vw" style={{ objectFit: "cover" }} />
          </HeroGalleryCell>
          <HeroGalleryCell $col={4} $spanRows>
            <Image src={imgFive[4]} alt="" fill sizes="(max-width:768px) 100vw, 25vw" style={{ objectFit: "cover" }} />
            <ShowAllPhotos type="button" onClick={() => { setPhotoModalOpen(true); setPhotoIndex(0); }}>
              <Grip size={16} aria-hidden />
              Show all {galleryImages.length} photo{galleryImages.length === 1 ? "" : "s"}
            </ShowAllPhotos>
          </HeroGalleryCell>
        </HeroWrap>
      </HeroSection>

      <ContentWrap>
        {/* About the experience + booking card, side by side (the card sits level with the bottom of the column). */}
        <TopRow>
          <MainCol>
            <HostIntro>
              <div>
                <HostIntroTitle>
                  {experience.hostName ? `Experience hosted by ${experience.hostName}` : "About this experience"}
                </HostIntroTitle>
                {metaLine && <HostIntroMeta>{metaLine}</HostIntroMeta>}
              </div>
              {experience.hostName && (
                <Avatar $size={60}>
                  {experience.hostImage ? <Image src={experience.hostImage} alt="" width={60} height={60} /> : initialOf(experience.hostName)}
                </Avatar>
              )}
            </HostIntro>

            <SectionTitle>What we will do</SectionTitle>
            <BodyText>
              {descToShow}
              {needReadMore && !readMore && (
                <>
                  {" "}
                  <ReadMore type="button" onClick={() => setReadMore(true)}>Read More</ReadMore>
                </>
              )}
            </BodyText>

            {included.length > 0 && (
              <IncludedBlock>
                <SectionHeader>
                  <SectionTitle>What&apos;s included</SectionTitle>
                  {included.length > 1 && (
                    <PillNav $variant="round">
                      <PillNavBtn type="button" onClick={() => scrollIncluded(-1)} aria-label="Previous included items"><ChevronLeft size={20} /></PillNavBtn>
                      <PillNavBtn type="button" $next onClick={() => scrollIncluded(1)} aria-label="Next included items"><ChevronRight size={20} /></PillNavBtn>
                    </PillNav>
                  )}
                </SectionHeader>
                <IncludedTrack ref={includedRef}>
                  {included.map((inc, i) => {
                    const Icon = includedIcon(inc.title);
                    return (
                      <IncludedCard key={i}>
                        <IncludedHead>
                          <Icon size={40} strokeWidth={1.5} aria-hidden />
                          <IncludedTitle>{inc.title}</IncludedTitle>
                        </IncludedHead>
                        <IncludedList>
                          {inc.items.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </IncludedList>
                      </IncludedCard>
                    );
                  })}
                </IncludedTrack>
              </IncludedBlock>
            )}
          </MainCol>

          <BookingCol>
            <BookingCard>
              <PriceLead>
                From {formatPriceWithUnit(experience.price, "Lei")} / <PriceUnit>person</PriceUnit>
              </PriceLead>
              <BookingFields>
                <BookingField $side="left">
                  DATES
                  <BookingSelect aria-label="Dates" defaultValue="">
                    <option value="">Add dates</option>
                    {availability.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </BookingSelect>
                  <BookingChevron size={18} aria-hidden />
                </BookingField>
                <BookingField $side="right">
                  GUESTS
                  <BookingSelect aria-label="Guests" defaultValue="1">
                    <option value="1">1 guest</option>
                    <option value="2">2 guests</option>
                    <option value="3">3+ guests</option>
                  </BookingSelect>
                  <BookingChevron size={18} aria-hidden />
                </BookingField>
              </BookingFields>
              {availability.length > 0 ? (
                <>
                  {visibleSlots.map((slot, i) => {
                    const [day, time] = slot.split(" · ");
                    return (
                      <SlotRow key={i}>
                        <div>
                          <SlotDate>{day}</SlotDate>
                          {time && <SlotTime>{time}</SlotTime>}
                        </div>
                        <SlotSide>
                          <SlotPrice>{formatPriceWithUnit(experience.price, "lei")} / <span>person</span></SlotPrice>
                          <ChooseBtn type="button">Choose</ChooseBtn>
                        </SlotSide>
                      </SlotRow>
                    );
                  })}
                  {availability.length > SLOTS_SHOWN && (
                    <MoreDatesBtn type="button" onClick={() => setShowAllDates((v) => !v)}>
                      {showAllDates ? "Show fewer dates" : "Show more dates"}
                    </MoreDatesBtn>
                  )}
                </>
              ) : (
                <NoDates>The host hasn&apos;t published dates yet.</NoDates>
              )}
            </BookingCard>
          </BookingCol>
        </TopRow>

        {/* Meet the host */}
        {experience.hostName && (
          <Section>
            <HostCard>
              <Avatar $size={70}>
                {experience.hostImage ? <Image src={experience.hostImage} alt="" width={70} height={70} /> : initialOf(experience.hostName)}
              </Avatar>
              <HostCardText>
                <HostCardName>Meet your Host, {experience.hostName}</HostCardName>
                {experience.hostSince && <p>Host on Locals Only since {experience.hostSince}</p>}
                {reviewCount > 0 && (
                  <IconLine>
                    <Star size={16} fill="currentColor" strokeWidth={0} aria-hidden />
                    {experience.rating.toFixed(2)} ({reviewCount} {reviewCount === 1 ? "Review" : "Reviews"})
                  </IconLine>
                )}
              </HostCardText>
            </HostCard>
            {experience.hostBio && <BodyText>{experience.hostBio}</BodyText>}
            <HostActions>
              <ContactHostBtn type="button">Contact Host</ContactHostBtn>
              <SafetyNote>
                <Radar size={16} aria-hidden />
                <span>
                  To protect your payment, never transfer money or communicate outside of the Locals Only website or app{" "}
                  <a href="/about">Learn more...</a>
                </span>
              </SafetyNote>
            </HostActions>
            {isHost && <HostActions><EditLink type="button" onClick={() => setIsEditing(true)}>Edit Experience</EditLink></HostActions>}
          </Section>
        )}

        {/* Where you'll be */}
        <Section>
          <SectionTitle>Where you&apos;ll be</SectionTitle>
          <MapFrame>
            <iframe
              title={`Map of ${experience.location}`}
              src={`https://www.google.com/maps?q=${mapQuery}&z=10&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </MapFrame>
          {experience.whereDescription && <BodyText>{experience.whereDescription}</BodyText>}
          <MapLink>
            <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">
              Open {experience.location} in Google Maps
            </a>
          </MapLink>
        </Section>

        {/* Things to know */}
        {(guestRequirements.length > 0 || toBring.length > 0 || experience.cancellationPolicy) && (
          <Section>
            <SectionTitle>Things to know</SectionTitle>
            <ThingsGrid>
              <ThingsCol>
                {guestRequirements.length > 0 && (
                  <>
                    <ThingsTitle>Guest requirements</ThingsTitle>
                    <ThingsList>
                      {guestRequirements.map((x, i) => (
                        <li key={i}><CircleCheck size={14} aria-hidden />{x}</li>
                      ))}
                    </ThingsList>
                  </>
                )}
              </ThingsCol>
              <ThingsCol>
                {toBring.length > 0 && (
                  <>
                    <ThingsTitle>What to bring</ThingsTitle>
                    <ThingsList>
                      {toBring.map((x, i) => (
                        <li key={i}><CircleCheck size={14} aria-hidden />{x}</li>
                      ))}
                    </ThingsList>
                  </>
                )}
              </ThingsCol>
              <ThingsCol>
                {experience.cancellationPolicy && (
                  <>
                    <ThingsTitle>Cancellation policy</ThingsTitle>
                    <PolicyText>{experience.cancellationPolicy}</PolicyText>
                  </>
                )}
              </ThingsCol>
            </ThingsGrid>
          </Section>
        )}

        {/* Available badges */}
        {badges.length > 0 && (
          <Section>
            <SectionHeader>
              <SectionTitle>Available badges for this activity</SectionTitle>
              <PillNav $variant="round">
                <PillNavBtn type="button" disabled={badgeOffset >= 0} onClick={() => slide(badgeRef, setBadgeOffset, 1, CARD)} aria-label="Previous badges"><ChevronLeft size={20} /></PillNavBtn>
                <PillNavBtn type="button" $next disabled={badgeOffset <= -((badges.length - 1) * CARD)} onClick={() => slide(badgeRef, setBadgeOffset, -1, CARD)} aria-label="Next badges"><ChevronRight size={20} /></PillNavBtn>
              </PillNav>
            </SectionHeader>
            <SliderTrack ref={badgeRef}>
              <SliderList $offset={badgeOffset} $gap={10}>
                {badges.map((b) => (
                  <ChallengeBadgeCard key={b.id} title={b.title} description={b.description} icon={b.icon} complete={false} incompleteLabel="BADGE AVAILABLE" />
                ))}
              </SliderList>
            </SliderTrack>
          </Section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <Section>
            <SectionHeader>
              <ReviewsTitleRow>
                <SectionTitle>Reviews</SectionTitle>
                <IconLine as="span">
                  <Star size={16} fill="currentColor" strokeWidth={0} aria-hidden />
                  {experience.rating.toFixed(2)} ({reviewCount} {reviewCount === 1 ? "Review" : "Reviews"})
                </IconLine>
              </ReviewsTitleRow>
              <TextNav>
                <TextNavBtn type="button" disabled={reviewOffset >= 0} onClick={() => slide(reviewRef, setReviewOffset, 1, REVIEW_CARD)}>Prev</TextNavBtn>
                <TextNavBtn type="button" $next disabled={reviewOffset <= -((reviews.length - 1) * REVIEW_CARD)} onClick={() => slide(reviewRef, setReviewOffset, -1, REVIEW_CARD)}>Next</TextNavBtn>
              </TextNav>
            </SectionHeader>
            <SliderTrack ref={reviewRef}>
              <SliderList $offset={reviewOffset} $gap={20}>
                {reviews.map((r) => (
                  <ReviewCard key={r.id}>
                    <ReviewHeader>
                      <Avatar $size={70} aria-hidden>{initialOf(r.authorName)}</Avatar>
                      <ReviewMeta>
                        <ReviewName>{r.authorName}</ReviewName>
                        <span>
                          <span aria-label={`${r.rating} out of 5 stars`}>{"★".repeat(r.rating)}</span> ·{" "}
                          {new Date(r.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                        </span>
                      </ReviewMeta>
                    </ReviewHeader>
                    <ReviewText>{r.text}</ReviewText>
                  </ReviewCard>
                ))}
              </SliderList>
            </SliderTrack>
          </Section>
        )}

        {/* Similar experiences */}
        {similar.length > 0 && (
          <SimilarSection>
            <SectionHeader>
              <AccentTitle>Similar experiences</AccentTitle>
              <PillNav $variant="square">
                <PillNavBtn type="button" disabled={similarOffset >= 0} onClick={() => slide(similarRef, setSimilarOffset, 1, CARD)} aria-label="Previous similar experiences"><ChevronLeft size={20} /></PillNavBtn>
                <PillNavBtn type="button" $next disabled={similarOffset <= -((similar.length - 1) * CARD)} onClick={() => slide(similarRef, setSimilarOffset, -1, CARD)} aria-label="Next similar experiences"><ChevronRight size={20} /></PillNavBtn>
              </PillNav>
            </SectionHeader>
            <SliderTrack ref={similarRef}>
              <SliderList $offset={similarOffset} $gap={20}>
                {similar.map((e) => (
                  <SimilarSlot key={e.id}>
                    <ExperienceCard experience={e} />
                  </SimilarSlot>
                ))}
              </SliderList>
            </SliderTrack>
          </SimilarSection>
        )}
      </ContentWrap>

      {photoModalOpen && (
        <PhotoModalOverlay onClick={() => setPhotoModalOpen(false)} role="dialog" aria-modal="true" aria-label="Photo gallery">
          <PhotoModalCloseBtn type="button" onClick={() => setPhotoModalOpen(false)} aria-label="Close">
            <X size={24} />
          </PhotoModalCloseBtn>
          <PhotoModalNavBtn
            type="button"
            $side="left"
            onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => Math.max(0, i - 1)); }}
            disabled={photoIndex <= 0}
            aria-label="Previous photo"
          >
            <ChevronLeft size={28} />
          </PhotoModalNavBtn>
          <PhotoModalInner onClick={(e) => e.stopPropagation()}>
            <Image
              src={galleryImages[photoIndex]}
              alt={`Photo ${photoIndex + 1} of ${galleryImages.length}`}
              fill
              sizes="90vw"
              style={{ objectFit: "contain" }}
            />
          </PhotoModalInner>
          <PhotoModalNavBtn
            type="button"
            $side="right"
            onClick={(e) => { e.stopPropagation(); setPhotoIndex((i) => Math.min(galleryImages.length - 1, i + 1)); }}
            disabled={photoIndex >= galleryImages.length - 1}
            aria-label="Next photo"
          >
            <ChevronRight size={28} />
          </PhotoModalNavBtn>
          <PhotoModalCounter onClick={(e) => e.stopPropagation()}>
            {photoIndex + 1} / {galleryImages.length}
          </PhotoModalCounter>
        </PhotoModalOverlay>
      )}
    </>
  );
}
