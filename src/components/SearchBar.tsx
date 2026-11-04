"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type FocusEvent,
} from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { DayPicker, type DateRange } from "react-day-picker";
import { Search } from "lucide-react";
import type { SearchParams, SearchDate } from "@/types/search";
import "react-day-picker/style.css";

// --- Styled components ---

const Outer = styled.div`
  width: 100%;
  min-width: 0;
`;

const Container = styled.div`
  display: flex;
  align-items: stretch;
  border-radius: 9999px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  background: transparent;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  &:focus-within {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* The inner fields drop their own outline, so the pill shows keyboard focus instead. */
  &:has(:focus-visible) {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`;

const Section = styled.div<{ $focused: boolean; $variant?: "anywhere" | "anytime" | "experience" }>`
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  min-height: 34px;
  transition: background 0.2s ease;
  flex: ${({ $variant }) =>
    $variant === "experience" ? "1 1 44%" : "0 0 28%"};
  min-width: 0;

  /* Anywhere */
  ${({ $variant, theme }) =>
    $variant === "anywhere" &&
    `
    background: ${theme.colors.surface};
    color: ${theme.colors.textPrimary};
  `}

  /* Anytime: accent bg */
  ${({ $variant, theme }) =>
    $variant === "anytime" &&
    `
    background: ${theme.colors.accent};
    color: ${theme.colors.onAccent};
    cursor: pointer;
  `}

  /* Experience: white bg, black text (always) */
  ${({ $variant }) =>
    $variant === "experience" &&
    `
    background: #ffffff;
    color: #1f1f1f;
  `}
`;

const SectionAnywhere = styled(Section).attrs({ $variant: "anywhere" })``;
const SectionAnytime = styled(Section).attrs({ $variant: "anytime" })``;
const SectionExperience = styled(Section).attrs({ $variant: "experience" })``;

const Input = styled.input`
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

/** Input in Experience section: black text, gray placeholder */
const InputExperience = styled(Input)`
  color: #1f1f1f;

  &::placeholder {
    color: #6b6b6b; /* 5.3:1 on white (was #888, 3.5:1) */
  }
`;

const AnytimeTrigger = styled.button`
  width: 100%;
  text-align: left;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: inherit;
  cursor: pointer;
  padding: 0;
`;

const SearchIconWrap = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  margin-left: 0.25rem;
  color: #1f1f1f;
`;

const ExperienceInner = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
`;

const DatePopover = styled.div`
  z-index: 1100;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.card};
  padding: 0.75rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.8125rem;

  /* Match FilterBar/FilterDropdown: 8px radius, accent when selected, surface on hover */
  .rdp-root {
    --rdp-accent-color: ${({ theme }) => theme.colors.accent};
    --rdp-accent-background-color: ${({ theme }) => theme.colors.surface};
    --rdp-range_start-color: ${({ theme }) => theme.colors.onAccent};
    --rdp-range_end-color: ${({ theme }) => theme.colors.onAccent};
    --rdp-today-color: ${({ theme }) => theme.colors.accent};
    --rdp-day-height: 34px;
    --rdp-day-width: 34px;
    --rdp-day_button-height: 30px;
    --rdp-day_button-width: 30px;
    --rdp-day_button-border-radius: 8px;
    --rdp-day_button-border: 1px solid ${({ theme }) => theme.colors.border};
    --rdp-selected-border: 1px solid ${({ theme }) => theme.colors.accent};
    --rdp-nav-height: 2rem;
    --rdp-nav_button-height: 1.75rem;
    --rdp-nav_button-width: 1.75rem;
    --rdp-months-gap: 1.25rem;
  }

  .rdp-caption_label {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 600;
    font-size: 0.875rem;
  }

  .rdp-weekday {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.75rem;
    font-weight: 500;
  }

  /* Day cells: FilterButton-style hover (surface, accent border) when not selected */
  .rdp-day:not(.rdp-selected):not(.rdp-range_start):not(.rdp-range_end):not(.rdp-range_middle) .rdp-day_button:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  /* Nav: FilterButton-style (border, 8px, surface on hover) */
  .rdp-button_previous,
  .rdp-button_next {
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    color: ${({ theme }) => theme.colors.textPrimary};
    transition: all 0.2s ease;
  }

  .rdp-button_previous:hover:not(:disabled),
  .rdp-button_next:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  .rdp-chevron {
    fill: ${({ theme }) => theme.colors.accent};
  }
`;

const DatePopoverFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const ClearDatesButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.accentText};
  }
`;

const SuggestionsPopover = styled.div`
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  z-index: 1050;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  max-height: 240px;
  overflow-y: auto;
`;

const SuggestionItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const AnytimeWrapper = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`;

const AnywhereWrapper = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`;

const ExperienceWrapper = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`;

// --- Helpers ---

function toDateRange(d: SearchDate): DateRange | undefined {
  if (!d) return undefined;
  if (d instanceof Date) return { from: d, to: undefined };
  return { from: d.from, to: d.to };
}

function fromDateRange(r: DateRange | undefined): SearchDate {
  if (!r?.from) return null;
  if (!r.to || r.to.getTime() === r.from.getTime())
    return r.from;
  return { from: r.from, to: r.to };
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateLabel(d: SearchDate): string {
  if (!d) return "Anytime";
  if (d instanceof Date) {
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
  const from = d.from.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (!d.to) return from;
  const to = d.to.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${from} – ${to}`;
}

// --- Props ---

export interface SearchBarProps {
  value: SearchParams;
  onChange: (v: SearchParams) => void;
  onSearch: (v: SearchParams) => void;
  /** For future API: location autocomplete suggestions */
  locationSuggestions?: string[];
  /** For future API: experience/text autocomplete suggestions */
  experienceSuggestions?: string[];
  /** For future API: fetch location suggestions when query changes */
  onLocationQueryChange?: (query: string) => void;
  /** For future API: fetch experience suggestions when query changes */
  onExperienceQueryChange?: (query: string) => void;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  locationSuggestions = [],
  experienceSuggestions = [],
  onLocationQueryChange,
  onExperienceQueryChange,
}: SearchBarProps) {
  const [focused, setFocused] = useState<"anywhere" | "anytime" | "experience" | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showExperienceSuggestions, setShowExperienceSuggestions] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<{ top: number; left: number } | null>(null);
  const datePopRef = useRef<HTMLDivElement>(null);
  const anytimeRef = useRef<HTMLButtonElement>(null);

  // Position date picker via portal (avoids clipping by overflow:hidden). Measure on open.
  useLayoutEffect(() => {
    if (!showDatePicker || !anytimeRef.current) {
      // Measures the trigger in the DOM to position the date picker portal.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPickerPosition(null);
      return;
    }
    const rect = anytimeRef.current.getBoundingClientRect();
    const gap = 6;
    setPickerPosition({ top: rect.bottom + gap, left: rect.left });
  }, [showDatePicker]);

  // Close date picker on outside click
  useEffect(() => {
    if (!showDatePicker) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        datePopRef.current &&
        !datePopRef.current.contains(e.target as Node) &&
        anytimeRef.current &&
        !anytimeRef.current.contains(e.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [showDatePicker]);

  // Optional: request suggestions when query changes (debounce could be added by parent)
  useEffect(() => {
    onLocationQueryChange?.(value.location);
  }, [value.location, onLocationQueryChange]);

  useEffect(() => {
    onExperienceQueryChange?.(value.experience);
  }, [value.experience, onExperienceQueryChange]);

  const update = useCallback(
    (patch: Partial<SearchParams>) => {
      onChange({ ...value, ...patch });
    },
    [value, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSearch(value);
        setShowDatePicker(false);
        setShowLocationSuggestions(false);
        setShowExperienceSuggestions(false);
      }
    },
    [value, onSearch],
  );

  const handleAnywhereFocus = useCallback((e: FocusEvent) => {
    setFocused("anywhere");
    setShowLocationSuggestions(true);
    setShowDatePicker(false);
    setShowExperienceSuggestions(false);
  }, []);

  const handleAnywhereBlur = useCallback(() => {
    setFocused(null);
    setTimeout(() => setShowLocationSuggestions(false), 150);
  }, []);

  const handleAnytimeClick = useCallback(() => {
    setFocused("anytime");
    setShowDatePicker((v) => !v);
    setShowLocationSuggestions(false);
    setShowExperienceSuggestions(false);
  }, []);

  const handleAnytimeBlur = useCallback(() => {
    setFocused(null);
  }, []);

  const handleExperienceFocus = useCallback((e: FocusEvent) => {
    setFocused("experience");
    setShowExperienceSuggestions(true);
    setShowDatePicker(false);
    setShowLocationSuggestions(false);
  }, []);

  const handleExperienceBlur = useCallback(() => {
    setFocused(null);
    setTimeout(() => setShowExperienceSuggestions(false), 150);
  }, []);

  const handleDateSelect = useCallback(
    (range: DateRange | undefined) => {
      update({ date: fromDateRange(range) });
      // Close when a full range or single date is chosen
      if (range?.from && (range.to || range.from)) {
        setShowDatePicker(false);
      }
    },
    [update],
  );

  const handleClearDate = useCallback(() => {
    update({ date: null });
    setShowDatePicker(false);
  }, [update]);

  const handleLocationSuggestion = useCallback(
    (s: string) => {
      update({ location: s });
      setShowLocationSuggestions(false);
    },
    [update],
  );

  const handleExperienceSuggestion = useCallback(
    (s: string) => {
      update({ experience: s });
      setShowExperienceSuggestions(false);
    },
    [update],
  );

  const dateRange = toDateRange(value.date);

  return (
    <Outer>
      <Container onKeyDown={handleKeyDown} role="search">
        {/* Anywhere */}
        <SectionAnywhere $focused={focused === "anywhere"}>
          <AnywhereWrapper>
            <Input
              type="text"
              placeholder="Anywhere"
              value={value.location}
              onChange={(e) => update({ location: e.target.value })}
              onFocus={handleAnywhereFocus}
              onBlur={handleAnywhereBlur}
              aria-label="Location"
            />
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <SuggestionsPopover>
                {locationSuggestions.map((s) => (
                  <SuggestionItem
                    key={s}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleLocationSuggestion(s);
                    }}
                  >
                    {s}
                  </SuggestionItem>
                ))}
              </SuggestionsPopover>
            )}
          </AnywhereWrapper>
        </SectionAnywhere>

        {/* Anytime */}
        <SectionAnytime $focused={focused === "anytime"}>
          <AnytimeWrapper>
            <AnytimeTrigger
              ref={anytimeRef}
              type="button"
              onClick={handleAnytimeClick}
              onBlur={handleAnytimeBlur}
              aria-label="Date"
              aria-expanded={showDatePicker}
              aria-haspopup="dialog"
            >
              {formatDateLabel(value.date)}
            </AnytimeTrigger>
            {showDatePicker &&
              pickerPosition &&
              typeof document !== "undefined" &&
              createPortal(
                <DatePopover
                  ref={datePopRef}
                  style={{
                    position: "fixed",
                    top: pickerPosition.top,
                    left: pickerPosition.left,
                  }}
                >
                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateSelect}
                    defaultMonth={
                      value.date
                        ? value.date instanceof Date
                          ? value.date
                          : value.date.from
                        : new Date()
                    }
                    numberOfMonths={2}
                    disabled={{ before: startOfToday() }}
                  />
                  {value.date != null && (
                    <DatePopoverFooter>
                      <ClearDatesButton
                        type="button"
                        onClick={handleClearDate}
                        aria-label="Clear dates"
                      >
                        Clear dates
                      </ClearDatesButton>
                    </DatePopoverFooter>
                  )}
                </DatePopover>,
                document.body,
              )}
          </AnytimeWrapper>
        </SectionAnytime>

        {/* Experience */}
        <SectionExperience $focused={focused === "experience"}>
          <ExperienceWrapper>
            <ExperienceInner>
              <InputExperience
                type="text"
                placeholder="Find your adventure"
                value={value.experience}
                onChange={(e) => update({ experience: e.target.value })}
                onFocus={handleExperienceFocus}
                onBlur={handleExperienceBlur}
                aria-label="Experience search"
              />
              <SearchIconWrap aria-hidden>
                <Search size={14} strokeWidth={2} />
              </SearchIconWrap>
            </ExperienceInner>
            {showExperienceSuggestions && experienceSuggestions.length > 0 && (
              <SuggestionsPopover>
                {experienceSuggestions.map((s) => (
                  <SuggestionItem
                    key={s}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleExperienceSuggestion(s);
                    }}
                  >
                    {s}
                  </SuggestionItem>
                ))}
              </SuggestionsPopover>
            )}
          </ExperienceWrapper>
        </SectionExperience>
      </Container>
    </Outer>
  );
}
