"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Range, getTrackBackground } from "react-range";
import styled, { useTheme } from "styled-components";
import {
  ExperienceFilters,
  DEFAULT_FILTERS,
  ACTIVITY_TYPES,
  TIME_OF_DAYS,
  DURATIONS,
  SPECIALS,
} from "@/types/filters";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useExperienceCount } from "@/hooks/useExperienceCount";

const PRICE_STEP = 5;
const COUNT_DEBOUNCE_MS = 400;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.75rem, 4vw, 1.5rem);
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const ModalContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  width: 100%;
  max-width: min(960px, calc(100vw - 1.5rem));
  max-height: min(90vh, calc(100vh - 2rem));
  margin: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25);

  @media (min-width: 640px) {
    max-width: min(960px, calc(100vw - 2rem));
  }
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;

  @media (min-width: 640px) {
    padding: 1.25rem 1.5rem;
  }
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  justify-self: center;
  grid-column: 2;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: 10px;
  transition: background 0.2s ease, color 0.2s;
  width: 40px;
  height: 40px;
  grid-column: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const CloseIcon = styled.span`
  position: relative;
  width: 24px;
  height: 24px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 20px;
    height: 2px;
    background: currentColor;
    top: 50%;
    left: 50%;
  }

  &::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
`;

const Content = styled.div`
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (min-width: 640px) {
    padding: 1.5rem 1.75rem;
    gap: 1.75rem;
  }
`;

/* --- Price: compact one-row bar (Min | slider | Max) --- */
const PriceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
`;

const PriceTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
`;

const PriceBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;

  @media (min-width: 480px) {
    gap: 1rem;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const SectionSubtitle = styled.p`
  font-size: 0.8125rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

/* --- Activity: full width, 2 columns only, room for long labels --- */
const CheckboxGroupActivity = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem 0;

  @media (min-width: 520px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem 1.5rem;
  }

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem 1rem;
  }

  @media (min-width: 768px) {
    gap: 0.625rem 1.25rem;
  }
`;

/* --- Time, Duration, Specials: 3 cards in a row --- */
const FilterCardsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
`;

const FilterCard = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1rem 1.25rem;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  @media (min-width: 640px) {
    gap: 0.5rem;
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  cursor: pointer;
  padding: 0.5rem 0;
  min-height: 44px;
  border-radius: 8px;
  transition: background 0.2s ease;
  min-width: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  @media (min-width: 640px) {
    padding: 0.5rem;
    min-height: 40px;
  }
`;

const CheckboxInput = styled.input`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.accent};
`;

const CheckboxLabel = styled.span`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  @media (min-width: 640px) {
    gap: 0.5rem;
  }
`;

const RadioContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  cursor: pointer;
  padding: 0.5rem 0;
  min-height: 44px;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  @media (min-width: 640px) {
    padding: 0.5rem;
    min-height: 40px;
  }
`;

const RadioInput = styled.input`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.accent};
`;

const RadioLabel = styled.span`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  overflow-wrap: break-word;
  line-height: 1.4;
`;

const PriceInputWrap = styled.div`
  width: 72px;
  flex-shrink: 0;

  @media (min-width: 480px) {
    width: 80px;
  }
`;

const PriceInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 0.5rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.875rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const PriceSliderWrap = styled.div`
  flex: 1;
  min-width: 80px;
  padding: 2px 0;
  display: flex;
  align-items: center;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 1rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  gap: 0.75rem;
  flex-shrink: 0;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }

  @media (min-width: 640px) {
    padding: 1.25rem 1.5rem;
    gap: 1rem;
  }
`;

const ClearButton = styled.button`
  padding: 0.75rem 1.5rem;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.cardBackground};
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ShowResultsButton = styled.button`
  padding: 0.75rem 1.5rem;
  min-height: 44px;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }
`;

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ExperienceFilters;
  onFiltersChange: (filters: ExperienceFilters) => void;
  resultCount: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  resultCount,
  averagePrice,
  minPrice,
  maxPrice,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<ExperienceFilters>(filters);
  const theme = useTheme();
  const trackColor = theme?.colors?.border ?? "#e0e0e6";
  const accentColor = theme?.colors?.accent ?? "#E2A506";
  const thumbBg = theme?.colors?.background ?? "#fff";

  // Range needs max > min; when all experiences have the same price, use min + step
  const rangeMax = maxPrice > minPrice ? maxPrice : minPrice + PRICE_STEP;

  // Clamp to [minPrice, maxPrice] so Range never receives values outside bounds (avoids
  // "value (0) is smaller than min (35)" when localFilters or filters are [0,1000] before useEffect runs).
  // Range still uses rangeMax so min < max when all experiences share the same price.
  const rangeValues: [number, number] = (() => {
    const v0 = Math.max(minPrice, Math.min(localFilters.priceRange[0], maxPrice));
    const v1 = Math.max(minPrice, Math.min(localFilters.priceRange[1], maxPrice));
    return [Math.min(v0, v1), Math.max(v0, v1)];
  })();

  const debouncedLocalFilters = useDebouncedValue(localFilters, COUNT_DEBOUNCE_MS);
  const { data: countData, isFetching: isCountFetching } = useExperienceCount(
    debouncedLocalFilters,
    isOpen
  );
  const displayCount = countData?.totalCount ?? resultCount;

  useEffect(() => {
    const low = Math.max(minPrice, Math.min(filters.priceRange[0], maxPrice));
    const high = Math.max(minPrice, Math.min(filters.priceRange[1], maxPrice));
    const clamped: [number, number] = [Math.min(low, high), Math.max(low, high)];
    // Start the draft from the applied filters each time the modal opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalFilters({ ...filters, priceRange: clamped });
  }, [filters, isOpen, minPrice, maxPrice]);

  const handlePriceRangeChange = useCallback((vals: number[]) => {
    setLocalFilters((prev) => ({ ...prev, priceRange: [vals[0], vals[1]] }));
  }, []);

  const handleActivityTypeChange = useCallback(
    (activityType: string, checked: boolean) => {
      setLocalFilters((prev) => {
        const newTypes = checked
          ? [...prev.activityTypes, activityType as typeof ACTIVITY_TYPES[number]]
          : prev.activityTypes.filter((t) => t !== activityType);
        return { ...prev, activityTypes: newTypes };
      });
    },
    [],
  );

  const handleTimeOfDayChange = useCallback(
    (timeOfDay: string, checked: boolean) => {
      setLocalFilters((prev) => {
        const newTimes = checked
          ? [...prev.timeOfDays, timeOfDay as typeof TIME_OF_DAYS[number]]
          : prev.timeOfDays.filter((t) => t !== timeOfDay);
        return { ...prev, timeOfDays: newTimes };
      });
    },
    [],
  );

  const handleDurationChange = useCallback((duration: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      duration: duration as typeof DURATIONS[number] | null,
    }));
  }, []);

  const handleSpecialChange = useCallback(
    (special: string, checked: boolean) => {
      setLocalFilters((prev) => {
        const newSpecials = checked
          ? [...prev.specials, special as typeof SPECIALS[number]]
          : prev.specials.filter((s) => s !== special);
        return { ...prev, specials: newSpecials };
      });
    },
    [],
  );

  const handlePriceMinChange = useCallback(
    (value: string) => {
      setLocalFilters((prev) => {
        const numValue = Math.max(
          minPrice,
          Math.min(Number(value) || minPrice, prev.priceRange[1])
        );
        return { ...prev, priceRange: [numValue, prev.priceRange[1]] };
      });
    },
    [minPrice],
  );

  const handlePriceMaxChange = useCallback(
    (value: string) => {
      const numValue = Math.max(
        localFilters.priceRange[0],
        Math.min(maxPrice, Number(value) || localFilters.priceRange[0])
      );
      setLocalFilters((prev) => ({
        ...prev,
        priceRange: [prev.priceRange[0], numValue],
      }));
    },
    [localFilters.priceRange, maxPrice],
  );

  const handleClearAll = useCallback(() => {
    setLocalFilters(DEFAULT_FILTERS);
  }, []);

  const handleShowResults = useCallback(() => {
    onFiltersChange(localFilters);
    onClose();
  }, [localFilters, onFiltersChange, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <CloseButton onClick={onClose} aria-label="Close filters">
            <CloseIcon />
          </CloseButton>
          <Title>Filters</Title>
          <span style={{ width: 40, height: 40 }} aria-hidden />
        </Header>

        <Content>
          {/* Price: compact one-row bar */}
          <PriceSection>
            <PriceTitleRow>
              <SectionTitle>Price</SectionTitle>
              <SectionSubtitle>Avg. {Math.round(averagePrice)} Lei</SectionSubtitle>
            </PriceTitleRow>
            <PriceBar>
              <PriceInputWrap>
                <PriceInput
                  type="number"
                  min={minPrice}
                  max={rangeValues[1]}
                  value={rangeValues[0]}
                  onChange={(e) => handlePriceMinChange(e.target.value)}
                  placeholder="Min"
                />
              </PriceInputWrap>
              <PriceSliderWrap>
                <Range
                  values={rangeValues}
                  step={PRICE_STEP}
                  min={minPrice}
                  max={rangeMax}
                  onChange={handlePriceRangeChange}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: "6px",
                        width: "100%",
                        borderRadius: "4px",
                        background: getTrackBackground({
                          values: rangeValues,
                          colors: [trackColor, accentColor, trackColor],
                          min: minPrice,
                          max: rangeMax,
                        }),
                      }}
                    >
                      {children}
                    </div>
                  )}
                  renderThumb={({ props: { key, style, ...rest } }) => (
                    <div
                      key={key}
                      {...rest}
                      style={{
                        ...style,
                        height: "18px",
                        width: "18px",
                        borderRadius: "50%",
                        backgroundColor: accentColor,
                        border: `2px solid ${thumbBg}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        outline: "none",
                      }}
                    />
                  )}
                />
              </PriceSliderWrap>
              <PriceInputWrap>
                <PriceInput
                  type="number"
                  min={rangeValues[0]}
                  max={maxPrice}
                  value={rangeValues[1]}
                  onChange={(e) => handlePriceMaxChange(e.target.value)}
                  placeholder="Max"
                />
              </PriceInputWrap>
            </PriceBar>
          </PriceSection>

          {/* Activity type: full width, 2 cols, labels can wrap */}
          <Section>
            <SectionTitle>Activity type</SectionTitle>
            <CheckboxGroupActivity>
              {ACTIVITY_TYPES.map((type) => (
                <CheckboxContainer key={type}>
                  <CheckboxInput
                    type="checkbox"
                    checked={localFilters.activityTypes.includes(type)}
                    onChange={(e) => handleActivityTypeChange(type, e.target.checked)}
                  />
                  <CheckboxLabel>{type}</CheckboxLabel>
                </CheckboxContainer>
              ))}
            </CheckboxGroupActivity>
          </Section>

          {/* Time, Duration, Specials: 3 cards */}
          <FilterCardsRow>
            <FilterCard>
              <SectionTitle>Time of Day</SectionTitle>
              <CheckboxGroup>
                {TIME_OF_DAYS.map((time) => (
                  <CheckboxContainer key={time}>
                    <CheckboxInput
                      type="checkbox"
                      checked={localFilters.timeOfDays.includes(time)}
                      onChange={(e) => handleTimeOfDayChange(time, e.target.checked)}
                    />
                    <CheckboxLabel>{time}</CheckboxLabel>
                  </CheckboxContainer>
                ))}
              </CheckboxGroup>
            </FilterCard>
            <FilterCard>
              <SectionTitle>Duration</SectionTitle>
              <RadioGroup>
                {DURATIONS.map((duration) => (
                  <RadioContainer key={duration}>
                    <RadioInput
                      type="radio"
                      name="duration"
                      checked={localFilters.duration === duration}
                      onChange={() => handleDurationChange(duration)}
                    />
                    <RadioLabel>{duration}</RadioLabel>
                  </RadioContainer>
                ))}
              </RadioGroup>
            </FilterCard>
            <FilterCard>
              <SectionTitle>Specials</SectionTitle>
              <CheckboxGroup>
                {SPECIALS.map((special) => (
                  <CheckboxContainer key={special}>
                    <CheckboxInput
                      type="checkbox"
                      checked={localFilters.specials.includes(special)}
                      onChange={(e) => handleSpecialChange(special, e.target.checked)}
                    />
                    <CheckboxLabel>{special}</CheckboxLabel>
                  </CheckboxContainer>
                ))}
              </CheckboxGroup>
            </FilterCard>
          </FilterCardsRow>
        </Content>

        <Footer>
          <ClearButton onClick={handleClearAll}>Clear all</ClearButton>
          <ShowResultsButton onClick={handleShowResults} aria-busy={isCountFetching}>
            Show all {displayCount} results
          </ShowResultsButton>
        </Footer>
      </ModalContainer>
    </Overlay>,
    document.body
  );
}
