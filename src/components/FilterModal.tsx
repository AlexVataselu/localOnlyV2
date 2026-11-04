"use client";

import { useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";
import { X } from "lucide-react";
import { Button, SecondaryButton } from "@/components/ui/Status";
import { useExperiencesQuery } from "@/hooks/useExperiencesQuery";
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPES,
  DEFAULT_FILTERS,
  DURATION_LABELS,
  DURATIONS,
  type ExperienceFilters,
  SPECIAL_LABELS,
  SPECIALS,
  TIME_OF_DAY_LABELS,
  TIME_OF_DAYS,
} from "@/types/filters";
import { formatPrice } from "@/utils/formatters";

const Dialog = styled.dialog`
  width: min(640px, calc(100vw - 2rem));
  max-height: min(88vh, 900px);
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.textPrimary};
  box-shadow: ${({ theme }) => theme.shadows.cardHover};

  &[open] {
    display: flex;
    flex-direction: column;
  }

  &::backdrop {
    background: rgba(0, 0, 0, 0.55);
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h2 {
    margin: 0;
    font-size: 1.25rem;
  }
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 1.25rem 1.25rem;
`;

const Group = styled.fieldset`
  margin: 0;
  padding: 1.25rem 0;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  legend {
    padding: 0;
    margin-bottom: 0.75rem;
    font-size: 1.05rem;
    font-weight: 700;
  }
`;

const Hint = styled.p`
  margin: -0.25rem 0 0.75rem;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Options = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.25rem 1rem;
`;

const Choice = styled.label`
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 44px;
  cursor: pointer;

  input {
    width: 20px;
    height: 20px;
    margin: 0;
    flex-shrink: 0;
    accent-color: ${({ theme }) => theme.colors.accent};
  }
`;

const PriceRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  input {
    min-height: 44px;
    padding: 0 0.85rem;
    border-radius: 10px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 1rem;
  }
`;

const Foot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  filters: ExperienceFilters;
  onApply: (filters: ExperienceFilters) => void;
}

function toggle<T>(list: T[], value: T, on: boolean) {
  return on ? [...list, value] : list.filter((v) => v !== value);
}

function parsePrice(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Remounted on each open (see key in the parent) so the draft starts from the applied filters. */
export default function FilterModal({ open, onClose, filters, onApply }: FilterModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [draft, setDraft] = useState<ExperienceFilters>(filters);

  // Live count for the draft selection (one tiny page).
  const preview = useExperiencesQuery(draft, 1);
  const stats = preview.data?.pages[0];
  const count = stats?.totalCount;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const priceInvalid = draft.minPrice !== null && draft.maxPrice !== null && draft.minPrice > draft.maxPrice;

  return (
    <Dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (e.target === ref.current) onClose();
      }}
    >
      <Head>
        <h2 id={titleId}>Filters</h2>
        <IconButton type="button" onClick={onClose} aria-label="Close filters">
          <X size={22} aria-hidden />
        </IconButton>
      </Head>

      <Body>
        <Group>
          <legend>Activity type</legend>
          <Options>
            {ACTIVITY_TYPES.map((value) => (
              <Choice key={value}>
                <input
                  type="checkbox"
                  checked={draft.activityTypes.includes(value)}
                  onChange={(e) => setDraft((d) => ({ ...d, activityTypes: toggle(d.activityTypes, value, e.target.checked) }))}
                />
                {ACTIVITY_TYPE_LABELS[value]}
              </Choice>
            ))}
          </Options>
        </Group>

        <Group>
          <legend>Price per person</legend>
          {stats && stats.totalCount > 0 && (
            <Hint>
              Average for this selection: {formatPrice(stats.averagePrice)}. Most expensive listing:{" "}
              {formatPrice(stats.priceCeiling)}.
            </Hint>
          )}
          <PriceRow>
            <label>
              Minimum (lei)
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="No minimum"
                value={draft.minPrice ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, minPrice: parsePrice(e.target.value) }))}
                aria-invalid={priceInvalid || undefined}
              />
            </label>
            <label>
              Maximum (lei)
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="No maximum"
                value={draft.maxPrice ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, maxPrice: parsePrice(e.target.value) }))}
                aria-invalid={priceInvalid || undefined}
              />
            </label>
          </PriceRow>
          {priceInvalid && <Hint role="alert">The minimum is higher than the maximum.</Hint>}
        </Group>

        <Group>
          <legend>Time of day</legend>
          <Options>
            {TIME_OF_DAYS.map((value) => (
              <Choice key={value}>
                <input
                  type="checkbox"
                  checked={draft.timeOfDays.includes(value)}
                  onChange={(e) => setDraft((d) => ({ ...d, timeOfDays: toggle(d.timeOfDays, value, e.target.checked) }))}
                />
                {TIME_OF_DAY_LABELS[value]}
              </Choice>
            ))}
          </Options>
        </Group>

        <Group>
          <legend>Duration</legend>
          <Options>
            <Choice>
              <input type="radio" name="duration" checked={draft.duration === null} onChange={() => setDraft((d) => ({ ...d, duration: null }))} />
              Any length
            </Choice>
            {DURATIONS.map((value) => (
              <Choice key={value}>
                <input
                  type="radio"
                  name="duration"
                  checked={draft.duration === value}
                  onChange={() => setDraft((d) => ({ ...d, duration: value }))}
                />
                {DURATION_LABELS[value]}
              </Choice>
            ))}
          </Options>
        </Group>

        <Group>
          <legend>Extras</legend>
          <Options>
            {SPECIALS.map((value) => (
              <Choice key={value}>
                <input
                  type="checkbox"
                  checked={draft.specials.includes(value)}
                  onChange={(e) => setDraft((d) => ({ ...d, specials: toggle(d.specials, value, e.target.checked) }))}
                />
                {SPECIAL_LABELS[value]}
              </Choice>
            ))}
          </Options>
        </Group>
      </Body>

      <Foot>
        <SecondaryButton type="button" onClick={() => setDraft({ ...DEFAULT_FILTERS, q: draft.q, location: draft.location })}>
          Clear all
        </SecondaryButton>
        <Button
          type="button"
          disabled={priceInvalid}
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          {count === undefined ? "Show results" : count === 0 ? "No matches" : `Show ${count} ${count === 1 ? "result" : "results"}`}
        </Button>
      </Foot>
    </Dialog>
  );
}
