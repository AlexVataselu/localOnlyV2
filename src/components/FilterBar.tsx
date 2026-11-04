"use client";

import styled from "styled-components";
import { SlidersHorizontal, X } from "lucide-react";
import FilterDropdown, { FilterPill } from "@/components/FilterDropdown";
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPES,
  type ActivityType,
  countActiveFilters,
  DEFAULT_FILTERS,
  type ExperienceFilters,
  TIME_OF_DAY_LABELS,
  TIME_OF_DAYS,
  type TimeOfDay,
} from "@/types/filters";

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 0 1rem;

  @media (max-width: 760px) {
    flex-wrap: wrap;
  }
`;

const Fixed = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;

  @media (max-width: 760px) {
    flex-wrap: wrap;
    flex-shrink: 1;
  }
`;

/** Category chips scroll natively (touch, trackpad, shift+wheel). */
const Chips = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  padding: 2px;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.colors.border} transparent`};

  @media (max-width: 760px) {
    order: 10;
    flex-basis: 100%;
  }
`;

const Divider = styled.span`
  width: 1px;
  height: 28px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.border};

  @media (max-width: 760px) {
    display: none;
  }
`;

const Count = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.onAccent};
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.75rem;
  font-weight: 800;
`;

/** Price bands in lei. "any" clears the price filter. */
const PRICE_BANDS: Array<{ value: string; label: string; min: number | null; max: number | null }> = [
  { value: "any", label: "Any price", min: null, max: null },
  { value: "0-100", label: "Under 100 lei", min: null, max: 100 },
  { value: "100-250", label: "100–250 lei", min: 100, max: 250 },
  { value: "250-500", label: "250–500 lei", min: 250, max: 500 },
  { value: "500-", label: "500 lei and up", min: 500, max: null },
];

function priceBandValue(filters: ExperienceFilters) {
  const band = PRICE_BANDS.find((b) => b.min === filters.minPrice && b.max === filters.maxPrice);
  return band?.value ?? (filters.minPrice === null && filters.maxPrice === null ? "any" : "custom");
}

interface FilterBarProps {
  filters: ExperienceFilters;
  onChange: (filters: ExperienceFilters) => void;
  onOpenModal: () => void;
}

export default function FilterBar({ filters, onChange, onOpenModal }: FilterBarProps) {
  const activeCount = countActiveFilters(filters);
  const price = priceBandValue(filters);
  const time = filters.timeOfDays.length === 1 ? filters.timeOfDays[0] : filters.timeOfDays.length ? "custom" : "any";

  const toggleActivity = (activity: ActivityType) =>
    onChange({
      ...filters,
      activityTypes: filters.activityTypes.includes(activity)
        ? filters.activityTypes.filter((a) => a !== activity)
        : [...filters.activityTypes, activity],
    });

  const priceOptions = PRICE_BANDS.map(({ value, label }) => ({ value, label }));
  if (price === "custom") {
    priceOptions.push({
      value: "custom",
      label: `${filters.minPrice ?? 0}–${filters.maxPrice ?? "∞"} lei`,
    });
  }

  return (
    <Bar role="toolbar" aria-label="Filter experiences">
      <Fixed>
        <FilterPill type="button" $active onClick={onOpenModal} aria-haspopup="dialog">
          <SlidersHorizontal size={16} aria-hidden />
          Filters
          {activeCount > 0 && (
            <Count aria-label={`${activeCount} active`}>{activeCount}</Count>
          )}
        </FilterPill>
        <FilterDropdown
          label="Price"
          value={price}
          active={price !== "any"}
          options={priceOptions}
          onSelect={(value) => {
            const band = PRICE_BANDS.find((b) => b.value === value);
            if (band) onChange({ ...filters, minPrice: band.min, maxPrice: band.max });
          }}
        />
        <FilterDropdown
          label="Time of day"
          value={time}
          active={time !== "any"}
          options={[
            { value: "any", label: "Any time" },
            ...TIME_OF_DAYS.map((t) => ({ value: t, label: TIME_OF_DAY_LABELS[t] })),
            ...(time === "custom" ? [{ value: "custom", label: `${filters.timeOfDays.length} times selected` }] : []),
          ]}
          onSelect={(value) => {
            if (value === "custom") return;
            onChange({ ...filters, timeOfDays: value === "any" ? [] : [value as TimeOfDay] });
          }}
        />
      </Fixed>
      <Divider aria-hidden />
      <Chips>
        {ACTIVITY_TYPES.map((activity) => {
          const on = filters.activityTypes.includes(activity);
          return (
            <FilterPill key={activity} type="button" $active={on} aria-pressed={on} onClick={() => toggleActivity(activity)}>
              {ACTIVITY_TYPE_LABELS[activity]}
            </FilterPill>
          );
        })}
      </Chips>
      {activeCount > 0 && (
        <FilterPill
          type="button"
          onClick={() => onChange({ ...DEFAULT_FILTERS, q: filters.q, location: filters.location })}
        >
          <X size={16} aria-hidden />
          Clear
        </FilterPill>
      )}
    </Bar>
  );
}
