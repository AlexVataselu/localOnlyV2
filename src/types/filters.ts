/**
 * Filter vocabulary. Values are the API's enum codes; labels are for display.
 * Filters live in the URL (?activityTypes=SPORTS,WELLNESS&maxPrice=250), so a
 * filtered listing can be refreshed, shared and navigated back to.
 */

export const ACTIVITY_TYPE_LABELS = {
  ART_AND_CULTURE: "Art & culture",
  TOURS: "Tours",
  ENTERTAINMENT: "Entertainment",
  SIGHTSEEING: "Sightseeing",
  FOOD_AND_DRINK: "Food & drink",
  WELLNESS: "Wellness",
  SPORTS: "Sports",
  NATURE_AND_OUTDOORS: "Nature & outdoors",
} as const;

export const TIME_OF_DAY_LABELS = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
} as const;

export const DURATION_LABELS = {
  UP_TO_1H: "Up to 1 hour",
  ONE_TO_4H: "1–4 hours",
  FOUR_H_TO_1_DAY: "4 hours – 1 day",
  ONE_TO_3_DAYS: "1–3 days",
  THREE_PLUS_DAYS: "3+ days",
} as const;

export const SPECIAL_LABELS = {
  DEALS_AND_DISCOUNTS: "Deals & discounts",
  FREE_CANCELLATION: "Free cancellation",
  SKIP_THE_LINE: "Skip the line",
  LIKELY_TO_SELL_OUT: "Likely to sell out",
  PRIVATE_TOUR: "Private tour",
  NEW_EXPERIENCE: "New experience",
} as const;

export type ActivityType = keyof typeof ACTIVITY_TYPE_LABELS;
export type TimeOfDay = keyof typeof TIME_OF_DAY_LABELS;
export type Duration = keyof typeof DURATION_LABELS;
export type Special = keyof typeof SPECIAL_LABELS;

const keys = <T extends object>(o: T) => Object.keys(o) as Array<keyof T>;
export const ACTIVITY_TYPES = keys(ACTIVITY_TYPE_LABELS);
export const TIME_OF_DAYS = keys(TIME_OF_DAY_LABELS);
export const DURATIONS = keys(DURATION_LABELS);
export const SPECIALS = keys(SPECIAL_LABELS);

export interface ExperienceFilters {
  q: string;
  location: string;
  hostId: string;
  activityTypes: ActivityType[];
  timeOfDays: TimeOfDay[];
  duration: Duration | null;
  specials: Special[];
  minPrice: number | null;
  maxPrice: number | null;
}

export const DEFAULT_FILTERS: ExperienceFilters = {
  q: "",
  location: "",
  hostId: "",
  activityTypes: [],
  timeOfDays: [],
  duration: null,
  specials: [],
  minPrice: null,
  maxPrice: null,
};

type Readable = { get(name: string): string | null };

function readList<T extends string>(params: Readable, name: string, allowed: readonly T[]): T[] {
  const raw = params.get(name);
  if (!raw) return [];
  const set = new Set(raw.split(","));
  return allowed.filter((value) => set.has(value));
}

function readInt(params: Readable, name: string): number | null {
  const raw = params.get(name);
  if (raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

export function filtersFromSearchParams(params: Readable): ExperienceFilters {
  const duration = params.get("duration");
  return {
    q: params.get("q")?.slice(0, 100) ?? "",
    location: params.get("location")?.slice(0, 100) ?? "",
    hostId: params.get("hostId")?.slice(0, 64) ?? "",
    activityTypes: readList(params, "activityTypes", ACTIVITY_TYPES),
    timeOfDays: readList(params, "timeOfDays", TIME_OF_DAYS),
    duration: duration && duration in DURATION_LABELS ? (duration as Duration) : null,
    specials: readList(params, "specials", SPECIALS),
    minPrice: readInt(params, "minPrice"),
    maxPrice: readInt(params, "maxPrice"),
  };
}

/** Same keys the API accepts, so the query string can be forwarded as-is. */
export function filtersToSearchParams(filters: ExperienceFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.location.trim()) params.set("location", filters.location.trim());
  if (filters.hostId) params.set("hostId", filters.hostId);
  if (filters.activityTypes.length) params.set("activityTypes", [...filters.activityTypes].sort().join(","));
  if (filters.timeOfDays.length) params.set("timeOfDays", [...filters.timeOfDays].sort().join(","));
  if (filters.duration) params.set("duration", filters.duration);
  if (filters.specials.length) params.set("specials", [...filters.specials].sort().join(","));
  if (filters.minPrice !== null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("maxPrice", String(filters.maxPrice));
  return params;
}

/** Number of refinements beyond the search text, for the "Filters (3)" badge. */
export function countActiveFilters(filters: ExperienceFilters): number {
  return (
    filters.activityTypes.length +
    filters.timeOfDays.length +
    filters.specials.length +
    (filters.duration ? 1 : 0) +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.hostId ? 1 : 0)
  );
}
