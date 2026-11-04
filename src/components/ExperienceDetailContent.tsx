"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import styled from "styled-components";
import { Share2, Heart, ChevronLeft, ChevronRight, X, MoreVertical, Plus, Trash2 } from "lucide-react";
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
import type { Experience } from "@/types/experience";
import ChallengeBadgeCard from "@/components/home/ChallengeBadgeCard";
import ExperienceCard from "@/components/ExperienceCard";

// ---------- Layout ----------
/** Full-width hero: title, stars, location, share, save, photo gallery */
const HeroSection = styled.section`
  width: 100%;
  padding: 2rem clamp(24px, 5vw, 80px) 2rem;
`;

const PageWrapper = styled.div`
  width: 100%;
  padding: 1.5rem clamp(24px, 5vw, 80px) 4rem;
  display: flex;
  gap: 3rem;
  align-items: flex-start;

  @media (max-width: 1100px) {
    flex-direction: column;
  }
`;

const MainCol = styled.div`
  flex: 1;
  min-width: 0;
`;

const BookingCol = styled.aside`
  width: 380px;
  flex-shrink: 0;
  position: sticky;
  top: 100px;

  @media (max-width: 1100px) {
    width: 100%;
    position: static;
  }
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
  color: #fff;
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
  color: #fff;
`;

const HeroStar = styled.span`
  color: #ffd700;
  font-size: 1.1rem;
`;

const HeroLocationText = styled.span`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
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
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.95rem;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #fff;
  }
`;

/** 5-image gallery: [1 tall][2 tall][3 top, 4 bottom][5 tall with "Show all" button] — matches design */
const HeroWrap = styled.div`
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 6px;
  aspect-ratio: 2.5/1;
  min-height: 240px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1.5rem;

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
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover { background: rgba(0,0,0,0.85); }
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

// ---------- Host & What we'll do ----------
const HostRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;
const HostAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  flex-shrink: 0;
`;
const HostLabel = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const HostName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const MetaLine = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const SectionTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const Description = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const ReadMore = styled.button`
  margin-top: 0.5rem;
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;

  &:hover { opacity: 0.9; }
`;

// ---------- What's Included ----------
const IncludedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;
const IncludedCard = styled.div`
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
`;
const IncludedIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;
const IncludedTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const IncludedList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;

// ---------- Booking column ----------
const BookingCard = styled.div`
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;
const PriceLead = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 1.25rem;
`;
const PriceUnit = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const BookingSelect = styled.select`
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
`;
const BookingLabel = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 0.35rem;
`;
const SlotList = styled.div`
  margin-top: 1rem;
`;
const SlotRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-of-type { border-bottom: none; }
`;
const SlotInfo = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const SlotPrice = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const ChooseBtn = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  background: transparent;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.onAccent};
  }
`;
const ShowMoreDates = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 12px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  cursor: pointer;

  &:hover { border-color: ${({ theme }) => theme.colors.accent}; color: ${({ theme }) => theme.colors.accent}; }
`;

// ---------- Meet Your Host ----------
const HostSection = styled.section`
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
const HostSectionInner = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;
const HostAvatarBig = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  flex-shrink: 0;
`;
const HostDetails = styled.div`
  flex: 1;
  min-width: 200px;
`;
const HostSince = styled.p`
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const HostRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
`;
const Verified = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
`;
const HostBio = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const ContactHostBtn = styled.button`
  padding: 12px 24px;
  border-radius: 10px;
  border: none;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover { background: ${({ theme }) => theme.colors.accentHover}; }
`;
const SafetyNote = styled.p`
  margin: 1rem 0 0 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const EditLink = styled.button`
  margin-top: 0.75rem;
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
`;

// ---------- Where You'll Be ----------
const MapSection = styled.section`
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
const MapPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 2/1;
  border-radius: 16px;
  overflow: hidden;
  background: url("/map.png") center / cover no-repeat;
  position: relative;
  margin-bottom: 1rem;
`;
const MapMetrics = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-top: -40px;
  position: relative;
  z-index: 2;
  padding: 0 1rem;
`;
const Metric = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 8px 14px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const MapDesc = styled.p`
  margin: 1rem 0 0 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// ---------- Things to Know ----------
const ThingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
`;
const ThingsCol = styled.div``;
const ThingsList = styled.ul`
  margin: 0.5rem 0 0 0;
  padding-left: 1.2rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
`;
const ShowMorePolicy = styled.button`
  margin-top: 0.5rem;
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
`;

// ---------- Sliders (Badges, Reviews, Similar) ----------
const SliderSection = styled.section`
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;
const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;
const SliderTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
const SliderNav = styled.div`
  display: flex;
  gap: 4px;
`;
const SliderNavBtn = styled.button<{ $disabled?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) { border-color: ${({ theme }) => theme.colors.accent}; }
`;
const SliderTrack = styled.div`
  overflow: hidden;
`;
const SliderList = styled.div<{ $offset: number }>`
  display: flex;
  gap: 1rem;
  transform: translateX(${({ $offset }) => $offset}px);
  transition: transform 0.3s ease;
`;

// ---------- Review card ----------
const ReviewCard = styled.div`
  flex-shrink: 0;
  width: 320px;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;
const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;
const ReviewAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.border};
`;
const ReviewMeta = styled.div``;
const ReviewName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
`;
const ReviewSince = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const ReviewText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
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

// ---------- Mock / default data ----------
const WHATS_INCLUDED = [
  { icon: "☕", title: "Drinks", items: ["Bottle of water", "Tea"] },
  { icon: "🍽️", title: "Food", items: ["Soup", "Sandwich", "Power bars"] },
  { icon: "🚐", title: "Transport", items: ["ATV shuttle", "Gondola"] },
  { icon: "⛑️", title: "Gear", items: ["Full Suspension E-Bike", "Full Face Helmet"] },
  { icon: "⛺", title: "Rest area", items: ["Mountain cabin", "Spring area"] },
];

const MOCK_SLOTS = [
  { label: "Mon, Oct 16, 4:00 PM - 7:00 PM", price: 300 },
  { label: "Tue, Oct 17, 9:00 AM - 12:00 PM", price: 300 },
  { label: "Wed, Oct 18, 2:00 PM - 5:00 PM", price: 300 },
];

const MOCK_REVIEWS = [
  { name: "Alex M.", since: "Host on Locals Only since 2021", text: "An incredible ride with stunning views. Our host was knowledgeable and made sure everyone felt safe. Highly recommend!", avatar: null },
  { name: "Maria K.", since: "Guest", text: "One of the best experiences I've had. The Transfăgărășan road is breathtaking and the e-bikes were top quality.", avatar: null },
];

const BADGES_FOR_ACTIVITY = [
  { id: "o1", title: "Orienteering", description: "Adaptability, quick decision-making in varying terrain.", icon: "🧭", complete: true },
  { id: "o2", title: "Orienteering", description: "Adaptability, quick decision-making in varying terrain.", icon: "🧭", complete: false, incompleteLabel: "BADGE AVAILABLE" },
  { id: "mb1", title: "Mountain Biking", description: "Technical skills, balance, and trail awareness.", icon: "🚴", complete: false, incompleteLabel: "BADGE AVAILABLE" },
];

const GUEST_REQUIREMENTS = ["Guests ages 14 and up", "Up to 6 guests total", "Locals Only's health and safety guidelines apply", "Activity level is moderate", "The need for adventure"];
const WHAT_TO_BRING = ["Backpack", "Mountain shoes", "Windproof, waterproof jacket", "Comfortable sport clothes"];
const CANCELLATION = "Full refund if you cancel at least 7 days before the experience start time, or within 24 hours of booking if the experience is more than 48 hours away.";

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
  };
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
  const [saved, setSaved] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [readMore, setReadMore] = useState(false);
  const [showMorePolicy, setShowMorePolicy] = useState(false);
  const [badgeOffset, setBadgeOffset] = useState(0);
  const [reviewOffset, setReviewOffset] = useState(0);
  const [similarOffset, setSimilarOffset] = useState(0);
  const [similar, setSimilar] = useState<Experience[]>([]);
  const badgeRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const similarRef = useRef<HTMLDivElement>(null);

  const isHost = session?.user?.role === "HOST";
  const reviewCount = Math.max(1, Math.round(experience.rating * 12));
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
    });
  }, [title, location, price, images, description, activityTypes, timeOfDays, duration, specials, updateMutation, experience.id, experience.image]);

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
    setIsEditing(false);
  }, [experience]);

  useEffect(() => {
    if (!isEditing) {
      setTitle(experience.title);
      setLocation(experience.location);
      setPrice(experience.price.toString());
      setImages(experience.images?.length ? experience.images : experience.image ? [experience.image] : []);
      setDescription(experience.description || "");
      setActivityTypes(experience.activityTypes || []);
      setTimeOfDays(experience.timeOfDays || []);
      setDuration(experience.duration || null);
      setSpecials(experience.specials || []);
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
  const REVIEW_CARD = 320 + 16;

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
                {experience.rating.toFixed(1)} ({reviewCount} Reviews)
              </HeroRatingBadge>
              <HeroLocationText> · {experience.location}</HeroLocationText>
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
              <MoreVertical size={16} />
              Show all {galleryImages.length} photo{galleryImages.length === 1 ? "" : "s"}
            </ShowAllPhotos>
          </HeroGalleryCell>
        </HeroWrap>
      </HeroSection>

      <PageWrapper>
        <MainCol>
          {/* Experience hosted by & What we'll do */}
        {experience.hostName && (
          <HostRow>
            <HostAvatar>
              {experience.hostImage ? <Image src={experience.hostImage} alt="" width={40} height={40} style={{ objectFit: "cover" }} /> : <div style={{ width: 40, height: 40 }} />}
            </HostAvatar>
            <HostLabel>Experience hosted by <HostName>{experience.hostName}</HostName></HostLabel>
          </HostRow>
        )}
        <MetaLine>
          {experience.duration ?? "3 hours"} · Hosted in English and Romanian
        </MetaLine>

        <SectionTitle>What we&apos;ll do</SectionTitle>
        <Description>{descToShow}</Description>
        {needReadMore && <ReadMore type="button" onClick={() => setReadMore(true)}>Read more</ReadMore>}

        {/* What's Included */}
        <SectionTitle style={{ marginTop: "1.5rem" }}>What&apos;s included</SectionTitle>
        <IncludedGrid>
          {WHATS_INCLUDED.map((inc, i) => (
            <IncludedCard key={i}>
              <IncludedIcon>{inc.icon}</IncludedIcon>
              <IncludedTitle>{inc.title}</IncludedTitle>
              <IncludedList>
                {inc.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </IncludedList>
            </IncludedCard>
          ))}
        </IncludedGrid>

        {/* Meet Your Host */}
        <HostSection>
          <SectionTitle>Meet your host</SectionTitle>
          <HostSectionInner>
            <HostAvatarBig>
              {experience.hostImage ? <Image src={experience.hostImage} alt="" width={80} height={80} style={{ objectFit: "cover" }} /> : <div style={{ width: 80, height: 80 }} />}
            </HostAvatarBig>
            <HostDetails>
              <HostSince>Host on Locals Only since 2019</HostSince>
              <HostRating>★ {experience.rating.toFixed(1)} ({reviewCount} Reviews) · <Verified>Identity verified</Verified></HostRating>
              <HostBio>
                {experience.hostName} is passionate about mountain biking in the Carpathian Mountains and loves sharing hidden trails and local stories with guests.
              </HostBio>
              <ContactHostBtn type="button">Contact Host</ContactHostBtn>
              <SafetyNote>To protect your payment, never transfer money or communicate outside of the Locals Only website or app. <a href="#">Learn more…</a></SafetyNote>
              {isHost && <EditLink type="button" onClick={() => setIsEditing(true)}>Edit Experience</EditLink>}
            </HostDetails>
          </HostSectionInner>
        </HostSection>

        {/* Where You'll Be */}
        <MapSection>
          <SectionTitle>Where you&apos;ll be</SectionTitle>
          <MapPlaceholder />
          <MapMetrics>
            <Metric>4.7 km</Metric>
            <Metric>12m</Metric>
            <Metric>7m</Metric>
            <Metric>22.8 km/h</Metric>
          </MapMetrics>
          <MapDesc>
            You&apos;ll bike along the famous TRANSFĂGĂRĂȘAN road with views of Lake Bâlea and the surrounding peaks. The route combines paved sections with optional off-road segments.
          </MapDesc>
        </MapSection>

        {/* Things to Know */}
        <SliderSection>
          <SectionTitle>Things to know</SectionTitle>
          <ThingsGrid>
            <ThingsCol>
              <IncludedTitle>Guest requirements</IncludedTitle>
              <ThingsList>
                {GUEST_REQUIREMENTS.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ThingsList>
            </ThingsCol>
            <ThingsCol>
              <IncludedTitle>What to bring</IncludedTitle>
              <ThingsList>
                {WHAT_TO_BRING.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ThingsList>
            </ThingsCol>
            <ThingsCol>
              <IncludedTitle>Cancellation policy</IncludedTitle>
              <ThingsList>
                <li>{CANCELLATION}</li>
                {showMorePolicy && <li>If you cancel less than 7 days in advance or after the experience has started, no refund is available.</li>}
              </ThingsList>
              <ShowMorePolicy type="button" onClick={() => setShowMorePolicy((s) => !s)}>{showMorePolicy ? "Show less" : "Show more"}</ShowMorePolicy>
            </ThingsCol>
          </ThingsGrid>
        </SliderSection>

        {/* Available Badges */}
        <SliderSection>
          <SliderHeader>
            <SliderTitle>Available badges for this activity</SliderTitle>
            <SliderNav>
              <SliderNavBtn $disabled={badgeOffset >= 0} onClick={() => slide(badgeRef, setBadgeOffset, 1, CARD)} aria-label="Previous"><ChevronLeft size={20} /></SliderNavBtn>
              <SliderNavBtn $disabled={badgeOffset <= -(3 * CARD)} onClick={() => slide(badgeRef, setBadgeOffset, -1, CARD)} aria-label="Next"><ChevronRight size={20} /></SliderNavBtn>
            </SliderNav>
          </SliderHeader>
          <SliderTrack ref={badgeRef}>
            <SliderList $offset={badgeOffset}>
              {BADGES_FOR_ACTIVITY.map((b) => (
                <ChallengeBadgeCard key={b.id} title={b.title} description={b.description} icon={b.icon} complete={b.complete} incompleteLabel={b.incompleteLabel} />
              ))}
            </SliderList>
          </SliderTrack>
        </SliderSection>

        {/* Reviews */}
        <SliderSection>
          <SliderHeader>
            <SliderTitle>Reviews</SliderTitle>
            <SliderNav>
              <SliderNavBtn $disabled={reviewOffset >= 0} onClick={() => slide(reviewRef, setReviewOffset, 1, REVIEW_CARD)} aria-label="Prev"><ChevronLeft size={20} /></SliderNavBtn>
              <SliderNavBtn $disabled={reviewOffset <= -(MOCK_REVIEWS.length * REVIEW_CARD)} onClick={() => slide(reviewRef, setReviewOffset, -1, REVIEW_CARD)} aria-label="Next"><ChevronRight size={20} /></SliderNavBtn>
            </SliderNav>
          </SliderHeader>
          <SliderTrack ref={reviewRef}>
            <SliderList $offset={reviewOffset}>
              {MOCK_REVIEWS.map((r, i) => (
                <ReviewCard key={i}>
                  <ReviewHeader>
                    <ReviewAvatar />
                    <ReviewMeta>
                      <ReviewName>{r.name}</ReviewName>
                      <ReviewSince>{r.since}</ReviewSince>
                    </ReviewMeta>
                  </ReviewHeader>
                  <ReviewText>{r.text}</ReviewText>
                </ReviewCard>
              ))}
            </SliderList>
          </SliderTrack>
        </SliderSection>

        {/* Similar Experiences */}
        {similar.length > 0 && (
          <SliderSection>
            <SliderHeader>
              <SliderTitle>Similar experiences</SliderTitle>
              <SliderNav>
                <SliderNavBtn $disabled={similarOffset >= 0} onClick={() => slide(similarRef, setSimilarOffset, 1, 280)} aria-label="Prev"><ChevronLeft size={20} /></SliderNavBtn>
                <SliderNavBtn $disabled={similarOffset <= -(similar.length * 280)} onClick={() => slide(similarRef, setSimilarOffset, -1, 280)} aria-label="Next"><ChevronRight size={20} /></SliderNavBtn>
              </SliderNav>
            </SliderHeader>
            <SliderTrack ref={similarRef}>
              <SliderList $offset={similarOffset}>
                {similar.map((e) => (
                  <div key={e.id} style={{ flexShrink: 0, width: 280 }}>
                    <ExperienceCard experience={e} />
                  </div>
                ))}
              </SliderList>
            </SliderTrack>
          </SliderSection>
        )}
      </MainCol>

        {/* Booking column – sticky after hero */}
        <BookingCol>
          <BookingCard>
            <PriceLead>From {formatPriceWithUnit(experience.price, "Lei")} <PriceUnit>/ person</PriceUnit></PriceLead>
            <BookingLabel>DATES</BookingLabel>
            <BookingSelect><option>Select dates</option></BookingSelect>
            <BookingLabel>GUESTS</BookingLabel>
            <BookingSelect><option>1 guest</option><option>2 guests</option><option>3+ guests</option></BookingSelect>
            <SlotList>
              {MOCK_SLOTS.map((s, i) => (
                <SlotRow key={i}>
                  <div>
                    <SlotInfo>{s.label}</SlotInfo>
                    <SlotPrice>{formatPriceWithUnit(s.price, "Lei")} / person</SlotPrice>
                  </div>
                  <ChooseBtn type="button">Choose</ChooseBtn>
                </SlotRow>
              ))}
            </SlotList>
            <ShowMoreDates type="button">Show more dates</ShowMoreDates>
          </BookingCard>
        </BookingCol>
      </PageWrapper>

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
