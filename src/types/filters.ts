export type ActivityType =
  | "Art and culture"
  | "Tours"
  | "Entertainment"
  | "Sightseeing"
  | "Food and drink"
  | "Wellness"
  | "Sports"
  | "Nature and Outdoors";

export type TimeOfDay = "Morning" | "Afternoon" | "Evening";

export type Duration =
  | "Up to 1h"
  | "1 to 4h"
  | "4h to 1 day"
  | "1-3 days"
  | "3+ days";

export type Special =
  | "Deals & Discounts"
  | "Free Cancellation"
  | "Skip the line"
  | "Likely to sell out"
  | "Private tour"
  | "New Experience";

export interface ExperienceFilters {
  activityTypes: ActivityType[];
  priceRange: [number, number];
  timeOfDays: TimeOfDay[];
  duration: Duration | null;
  specials: Special[];
}

export const DEFAULT_FILTERS: ExperienceFilters = {
  activityTypes: [],
  priceRange: [0, 1000],
  timeOfDays: [],
  duration: null,
  specials: [],
};

export const ACTIVITY_TYPES: ActivityType[] = [
  "Art and culture",
  "Tours",
  "Entertainment",
  "Sightseeing",
  "Food and drink",
  "Wellness",
  "Sports",
  "Nature and Outdoors",
];

export const TIME_OF_DAYS: TimeOfDay[] = ["Morning", "Afternoon", "Evening"];

export const DURATIONS: Duration[] = [
  "Up to 1h",
  "1 to 4h",
  "4h to 1 day",
  "1-3 days",
  "3+ days",
];

export const SPECIALS: Special[] = [
  "Deals & Discounts",
  "Free Cancellation",
  "Skip the line",
  "Likely to sell out",
  "Private tour",
  "New Experience",
];
