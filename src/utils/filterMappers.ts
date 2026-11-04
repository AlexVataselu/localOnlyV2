import {
  ActivityType,
  TimeOfDay,
  Duration,
  Special,
} from "@/types/filters";
import type { $Enums } from "@prisma/client";

// Map display strings to Prisma enum values
export const mapActivityTypeToEnum = (display: ActivityType): $Enums.ActivityType => {
  const mapping: Record<ActivityType, $Enums.ActivityType> = {
    "Art and culture": "ART_AND_CULTURE",
    "Tours": "TOURS",
    "Entertainment": "ENTERTAINMENT",
    "Sightseeing": "SIGHTSEEING",
    "Food and drink": "FOOD_AND_DRINK",
    "Wellness": "WELLNESS",
    "Sports": "SPORTS",
    "Nature and Outdoors": "NATURE_AND_OUTDOORS",
  };
  return mapping[display];
};

export const mapTimeOfDayToEnum = (display: TimeOfDay): $Enums.TimeOfDay => {
  const mapping: Record<TimeOfDay, $Enums.TimeOfDay> = {
    "Morning": "MORNING",
    "Afternoon": "AFTERNOON",
    "Evening": "EVENING",
  };
  return mapping[display];
};

export const mapDurationToEnum = (display: Duration): $Enums.Duration => {
  const mapping: Record<Duration, $Enums.Duration> = {
    "Up to 1h": "UP_TO_1H",
    "1 to 4h": "ONE_TO_4H",
    "4h to 1 day": "FOUR_H_TO_1_DAY",
    "1-3 days": "ONE_TO_3_DAYS",
    "3+ days": "THREE_PLUS_DAYS",
  };
  return mapping[display];
};

export const mapSpecialToEnum = (display: Special): $Enums.Special => {
  const mapping: Record<Special, $Enums.Special> = {
    "Deals & Discounts": "DEALS_AND_DISCOUNTS",
    "Free Cancellation": "FREE_CANCELLATION",
    "Skip the line": "SKIP_THE_LINE",
    "Likely to sell out": "LIKELY_TO_SELL_OUT",
    "Private tour": "PRIVATE_TOUR",
    "New Experience": "NEW_EXPERIENCE",
  };
  return mapping[display];
};

// Reverse mappers: Prisma enum values to display strings
export const mapActivityTypeFromEnum = (enumValue: string): ActivityType => {
  const mapping: Record<string, ActivityType> = {
    "ART_AND_CULTURE": "Art and culture",
    "TOURS": "Tours",
    "ENTERTAINMENT": "Entertainment",
    "SIGHTSEEING": "Sightseeing",
    "FOOD_AND_DRINK": "Food and drink",
    "WELLNESS": "Wellness",
    "SPORTS": "Sports",
    "NATURE_AND_OUTDOORS": "Nature and Outdoors",
  };
  return mapping[enumValue] || enumValue as ActivityType;
};

export const mapTimeOfDayFromEnum = (enumValue: string): TimeOfDay => {
  const mapping: Record<string, TimeOfDay> = {
    "MORNING": "Morning",
    "AFTERNOON": "Afternoon",
    "EVENING": "Evening",
  };
  return mapping[enumValue] || enumValue as TimeOfDay;
};

export const mapDurationFromEnum = (enumValue: string | null): Duration | null => {
  if (!enumValue) return null;
  const mapping: Record<string, Duration> = {
    "UP_TO_1H": "Up to 1h",
    "ONE_TO_4H": "1 to 4h",
    "FOUR_H_TO_1_DAY": "4h to 1 day",
    "ONE_TO_3_DAYS": "1-3 days",
    "THREE_PLUS_DAYS": "3+ days",
  };
  return mapping[enumValue] || null;
};

export const mapSpecialFromEnum = (enumValue: string): Special => {
  const mapping: Record<string, Special> = {
    "DEALS_AND_DISCOUNTS": "Deals & Discounts",
    "FREE_CANCELLATION": "Free Cancellation",
    "SKIP_THE_LINE": "Skip the line",
    "LIKELY_TO_SELL_OUT": "Likely to sell out",
    "PRIVATE_TOUR": "Private tour",
    "NEW_EXPERIENCE": "New Experience",
  };
  return mapping[enumValue] || enumValue as Special;
};
