import type { ActivityType, Duration, Special, TimeOfDay } from "./filters";

/** Shapes returned by locals-only-api. Keep in sync with its serializers. */

export interface HostSummary {
  id: string;
  name: string | null;
  image: string | null;
}

export interface Experience {
  id: string;
  title: string;
  description: string | null;
  location: string;
  /** Whole lei per person. */
  price: number;
  currency: "RON";
  image: string;
  /** Null until the experience has reviews. */
  rating: number | null;
  ratingCount: number;
  activityTypes: ActivityType[];
  timeOfDays: TimeOfDay[];
  duration: Duration | null;
  specials: Special[];
  createdAt: string;
  updatedAt: string;
  host: HostSummary;
}

export interface ExperiencesPage {
  items: Experience[];
  page: number;
  nextPage: number | null;
  hasMore: boolean;
  totalCount: number;
  averagePrice: number;
  priceCeiling: number;
  currency: "RON";
}

export interface HostProfile {
  id: string;
  name: string | null;
  image: string | null;
  coverImage: string | null;
  bio: string | null;
  experienceCount: number;
  fromPrice: number;
  currency: "RON";
  rating: number | null;
  ratingCount: number;
  locations: string[];
}

export interface ExperienceInput {
  title: string;
  description: string | null;
  location: string;
  price: number;
  image: string;
  activityTypes: ActivityType[];
  timeOfDays: TimeOfDay[];
  duration: Duration | null;
  specials: Special[];
}

export type Role = "CLIENT" | "HOST";
