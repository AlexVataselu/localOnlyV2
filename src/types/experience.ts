import { ActivityType, TimeOfDay, Duration, Special } from "./filters";

export interface Experience {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  images?: string[];
  description?: string;
  activityTypes?: ActivityType[];
  timeOfDays?: TimeOfDay[];
  duration?: Duration | null;
  specials?: Special[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  hostName?: string | null;
  hostImage?: string | null;
}


/** A "What's included" group, e.g. { title: "Gear", items: ["E-bike", "Helmet"] }. */
export interface IncludedGroup {
  title: string;
  items: string[];
}

/** Per-listing details shown on the experience page; every field is optional to fill. */
export interface ExperienceExtras {
  included: IncludedGroup[];
  toBring: string[];
  guestRequirements: string[];
  cancellationPolicy: string | null;
  languages: string[];
  whereDescription: string | null;
  availability: string[];
}

export interface ExperienceReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export const EMPTY_EXTRAS: ExperienceExtras = {
  included: [],
  toBring: [],
  guestRequirements: [],
  cancellationPolicy: null,
  languages: [],
  whereDescription: null,
  availability: [],
};
