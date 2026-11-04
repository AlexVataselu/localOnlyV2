"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import styled from "styled-components";
import { SlidersHorizontal, X } from "lucide-react";
import FilterDropdown, { FilterRadioDropdown } from "@/components/FilterDropdown";
import { ExperienceFilters, TimeOfDay, ActivityType, DEFAULT_FILTERS } from "@/types/filters";

const FilterBarContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 0;
  flex-wrap: nowrap;
`;

const DraggableSection = styled.div<{ $isDragging: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: nowrap;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "grab")};
  user-select: none;
  min-width: 0;
  
  &::-webkit-scrollbar {
    display: none;
  }

  &:active {
    cursor: grabbing;
  }
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: nowrap;
  flex-shrink: 0;
`;

const FilterLabel = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`;

const FilterButton = styled.button<{ $isSelected: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme, $isSelected }) => 
    $isSelected ? theme.colors.accent : theme.colors.border};
  background: ${({ theme, $isSelected }) => 
    $isSelected ? theme.colors.accent : theme.colors.background};
  color: ${({ theme, $isSelected }) => 
    $isSelected ? theme.colors.onAccent : theme.colors.textPrimary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme, $isSelected }) => 
      $isSelected ? theme.colors.accent : theme.colors.surface};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Separator = styled.div`
  width: 1px;
  height: 32px;
  background: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 1rem;
  flex-shrink: 0;
`;

const PRICE_RANGES = [
  { label: "Any price", value: [0, Infinity] as [number, number] },
  { label: "Under $25", value: [0, 25] as [number, number] },
  { label: "$25 - $50", value: [25, 50] as [number, number] },
  { label: "$50 - $100", value: [50, 100] as [number, number] },
  { label: "$100 - $200", value: [100, 200] as [number, number] },
  { label: "$200+", value: [200, Infinity] as [number, number] },
];

const TIME_OF_DAY_OPTIONS = [
  { label: "Any time", value: "any" },
  { label: "Morning", value: "Morning" },
  { label: "Afternoon", value: "Afternoon" },
  { label: "Evening", value: "Evening" },
];

// Display labels mapped to ActivityType values
const ACTIVITY_TYPE_MAP: Array<{ label: string; value: ActivityType }> = [
  { label: "arts & culture", value: "Art and culture" },
  { label: "entertainment", value: "Entertainment" },
  { label: "food and drink", value: "Food and drink" },
  { label: "sports", value: "Sports" },
  { label: "tours", value: "Tours" },
  { label: "sightseeing", value: "Sightseeing" },
  { label: "nature", value: "Nature and Outdoors" },
];

const FiltersModalButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
    border-color: ${({ theme }) => theme.colors.accentHover};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const FilterIcon = styled(SlidersHorizontal)`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const ClearButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.surface};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ClearIcon = styled(X)`
  width: 14px;
  height: 14px;
`;

interface FilterBarProps {
  filters: ExperienceFilters;
  onFiltersChange: (filters: ExperienceFilters) => void;
  onOpenModal: () => void;
}

export default function FilterBar({ filters, onFiltersChange, onOpenModal }: FilterBarProps) {
  const draggableRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!draggableRef.current) return;
    
    // Don't start drag if clicking on a button or interactive element
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }

    setIsDragging(true);
    setStartX(e.pageX - draggableRef.current.offsetLeft);
    setScrollLeft(draggableRef.current.scrollLeft);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !draggableRef.current) return;
    e.preventDefault();
    const x = e.pageX - draggableRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    draggableRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch drag handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!draggableRef.current) return;
    
    // Don't start drag if touching a button
    const target = e.touches[0].target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }

    setIsDragging(true);
    setStartX(e.touches[0].pageX - draggableRef.current.offsetLeft);
    setScrollLeft(draggableRef.current.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !draggableRef.current) return;
    const x = e.touches[0].pageX - draggableRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    draggableRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Prevent text selection while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging]);
  const handlePriceRangeSelect = useCallback(
    (value: string | number | [number, number]) => {
      if (Array.isArray(value)) {
        const [min, max] = value;
        onFiltersChange({
          ...filters,
          priceRange: [min, max === Infinity ? 1000 : max],
        });
      }
    },
    [filters, onFiltersChange],
  );

  const handleTimeOfDaySelect = useCallback(
    (value: string | number | [number, number]) => {
      if (typeof value === "string") {
        if (value === "any") {
          onFiltersChange({
            ...filters,
            timeOfDays: [],
          });
        } else {
          const timeOfDay = value as TimeOfDay;
          onFiltersChange({
            ...filters,
            timeOfDays: [timeOfDay],
          });
        }
      }
    },
    [filters, onFiltersChange],
  );

  const handleActivityTypeToggle = useCallback(
    (activityType: ActivityType) => {
      const isSelected = filters.activityTypes.includes(activityType);
      const newActivityTypes = isSelected
        ? filters.activityTypes.filter((a) => a !== activityType)
        : [...filters.activityTypes, activityType];

      onFiltersChange({
        ...filters,
        activityTypes: newActivityTypes,
      });
    },
    [filters, onFiltersChange],
  );

  const getPriceRangeKey = useCallback((range: [number, number]) => {
    const max = range[1] === Infinity ? 'inf' : range[1];
    return `${range[0]}-${max}`;
  }, []);

  const selectedPriceKey = useMemo(() => {
    const rangeMax = filters.priceRange[1] >= 1000 ? Infinity : filters.priceRange[1];
    return getPriceRangeKey([filters.priceRange[0], rangeMax]);
  }, [filters.priceRange, getPriceRangeKey]);

  const isPriceActive = useMemo(() => {
    return !(filters.priceRange[0] === 0 && filters.priceRange[1] >= 1000);
  }, [filters.priceRange]);

  const selectedTimeOfDay = useMemo(() => {
    if (filters.timeOfDays.length === 0) return "any";
    return filters.timeOfDays[0];
  }, [filters.timeOfDays]);

  const isTimeOfDayActive = useMemo(() => {
    return filters.timeOfDays.length > 0;
  }, [filters.timeOfDays]);

  const hasActiveFilters = useMemo(() => {
    return (
      isPriceActive ||
      isTimeOfDayActive ||
      filters.activityTypes.length > 0 ||
      filters.duration != null ||
      filters.specials.length > 0
    );
  }, [
    isPriceActive,
    isTimeOfDayActive,
    filters.activityTypes.length,
    filters.duration,
    filters.specials.length,
  ]);

  const handleClearFilters = useCallback(() => {
    onFiltersChange(DEFAULT_FILTERS);
  }, [onFiltersChange]);

  return (
    <FilterBarContainer>
      {/* Filters Modal Button */}
      <FilterSection>
        <FiltersModalButton type="button" onClick={onOpenModal}>
          <FilterIcon />
          Filters
        </FiltersModalButton>
      </FilterSection>

      <Separator />

      {/* Price Dropdown */}
      <FilterSection>
        <FilterDropdown
          label="Price"
          value={selectedPriceKey}
          options={PRICE_RANGES.map((range) => ({
            label: range.label,
            value: getPriceRangeKey(range.value),
          }))}
          onSelect={(val) => {
            const str = String(val);
            const match = PRICE_RANGES.find((r) => 
              getPriceRangeKey(r.value) === str
            );
            if (match) {
              handlePriceRangeSelect(match.value);
            }
          }}
          isActive={false}
        />
      </FilterSection>

      <Separator />

      {/* Time of Day Radio Dropdown */}
      <FilterSection>
        <FilterRadioDropdown
          label="Time of Day"
          value={selectedTimeOfDay}
          options={TIME_OF_DAY_OPTIONS}
          onSelect={handleTimeOfDaySelect}
          isActive={isTimeOfDayActive}
        />
      </FilterSection>

      <Separator />

      {/* Activity Types Toggle Buttons - Draggable Section */}
      <DraggableSection
        ref={draggableRef}
        $isDragging={isDragging}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {ACTIVITY_TYPE_MAP.map(({ label, value }) => (
          <FilterButton
            key={value}
            type="button"
            $isSelected={filters.activityTypes.includes(value)}
            onClick={() => handleActivityTypeToggle(value)}
          >
            {label}
          </FilterButton>
        ))}
      </DraggableSection>

      {hasActiveFilters && (
        <>
          <Separator />
          <FilterSection>
            <ClearButton type="button" onClick={handleClearFilters} aria-label="Clear all filters">
              <ClearIcon aria-hidden />
              Clear
            </ClearButton>
          </FilterSection>
        </>
      )}
    </FilterBarContainer>
  );
}
