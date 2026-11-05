"use client";

import { useState } from "react";
import styled from "styled-components";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cellKey, formatDayKey } from "@/lib/slotTime";

/** What the calendar needs to know about a day that has bookable slots. */
export interface DayInfo {
  slots: number;
  /** Places free across the day's slots; 0 = sold out. */
  remaining: number;
  fromPrice: number;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// ---------- Styles (Figma: "date pick modal") ----------
const Popover = styled.div`
  position: absolute;
  z-index: 40;
  top: calc(100% + 10px);
  right: 0;
  width: min(712px, calc(100vw - 32px));
  padding: 24px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  box-shadow: 0 20px 24px -4px rgba(16, 24, 40, 0.18), 0 8px 8px -4px rgba(16, 24, 40, 0.08);

  /* Phones: one month, as wide as the booking card's content box allows. */
  @media (max-width: 760px) {
    left: -20px;
    right: -20px;
    width: auto;
    padding: 16px 12px;
  }
`;
const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 8px;
  flex-wrap: wrap;
`;
const HeadTitle = styled.p`
  margin: 0 0 8px 0;
  font-size: 1.625rem;
  font-weight: 700;
  line-height: 1.1;
`;
const HeadSub = styled.p`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const DateChip = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 165px;
  padding: 8px 12px;
  border-radius: 8px;
  border: ${({ $active, theme }) => ($active ? `2px solid ${theme.colors.textPrimary}` : `1px solid ${theme.colors.textSecondary}`)};

  span { display: block; }
  span:first-child { font-size: 0.75rem; font-weight: 600; line-height: 14px; }
  span:last-child { font-size: 1rem; line-height: 24px; }
`;
const ChipClear = styled.button`
  display: flex;
  padding: 2px;
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  border-radius: 50%;
`;
const Months = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    & > :nth-child(2) { display: none; }
  }
`;
const Month = styled.div`
  padding: 20px 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const MonthHead = styled.div`
  position: relative;
  width: 280px;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 1rem;
  font-weight: 600;
  line-height: 24px;
`;
const MonthNav = styled.button<{ $side: "left" | "right"; $mobileOnly?: boolean }>`
  position: absolute;
  ${({ $side }) => ($side === "left" ? "left: 0;" : "right: 0;")}
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  padding: 4px;
  border: none;
  border-radius: 50%;
  background: none;
  color: inherit;
  cursor: pointer;

  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.surface}; }
  &:disabled { opacity: 0.3; cursor: default; }

  /* Phones show one month, so its header carries the "next" arrow too. */
  ${({ $mobileOnly }) => ($mobileOnly ? "@media (min-width: 761px) { display: none; }" : "")}
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 40px);
  row-gap: 4px;
`;
const WeekdayCell = styled.span`
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
`;
const DayCell = styled.button<{ $selected: boolean; $available: boolean }>`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: none;
  padding: 0;
  font-size: 0.875rem;
  font-weight: ${({ $available, $selected }) => ($selected ? 900 : $available ? 600 : 400)};
  cursor: ${({ $available }) => ($available ? "pointer" : "default")};
  color: ${({ $selected, $available, theme }) =>
    $selected ? theme.colors.cardBackground : $available ? theme.colors.textPrimary : theme.colors.textSecondary};
  background: ${({ $selected, theme }) => ($selected ? theme.colors.textPrimary : "transparent")};
  text-decoration: ${({ $available }) => ($available ? "none" : "line-through")};

  /* A small accent dot marks days with places free. */
  &::after {
    content: "";
    display: ${({ $available, $selected }) => ($available && !$selected ? "block" : "none")};
    position: absolute;
    left: 50%;
    bottom: 5px;
    width: 4px;
    height: 4px;
    margin-left: -2px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
  }

  &:hover:not(:disabled) { background: ${({ $selected, theme }) => ($selected ? theme.colors.textPrimary : theme.colors.surface)}; }
  &:disabled { opacity: 0.6; }
`;
const Empty = styled.span``;
const Bottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 16px 8px 0;
  flex-wrap: wrap;
`;
const Legend = styled.p`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  i { width: 6px; height: 6px; border-radius: 50%; background: ${({ theme }) => theme.colors.accent}; }
`;
const Ctas = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
`;
const ClearBtn = styled.button`
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;

  &:disabled { opacity: 0.4; cursor: default; }
`;
const CloseBtn = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.cardBackground};
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
`;

// ---------- Component ----------
interface Props {
  id: string;
  days: Map<string, DayInfo>;
  selected: string | null;
  onSelect: (key: string | null) => void;
  onClose: () => void;
  /** First and last month (as "YYYY-MM") the guest can page to. */
  firstMonth: string;
  lastMonth: string;
}

const monthIndex = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return y * 12 + (m - 1);
};

export default function BookingCalendar({ id, days, selected, onSelect, onClose, firstMonth, lastMonth }: Props) {
  const min = monthIndex(firstMonth);
  const max = monthIndex(lastMonth);
  const [start, setStart] = useState(() => (selected ? Math.min(Math.max(monthIndex(selected.slice(0, 7)), min), max) : min));

  const info = selected ? days.get(selected) : undefined;

  const renderMonth = (abs: number, nav: { prev?: boolean; next?: boolean; mobileNext?: boolean }) => {
    const year = Math.floor(abs / 12);
    const month = abs % 12;
    const firstDow = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7; // Monday first
    const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return (
      <Month key={abs}>
        <MonthHead>
          {nav.prev && (
            <MonthNav type="button" $side="left" onClick={() => setStart((s) => s - 1)} disabled={start <= min} aria-label="Previous month">
              <ChevronLeft size={16} />
            </MonthNav>
          )}
          <span aria-live="polite">{MONTHS[month]} {year}</span>
          {(nav.next || nav.mobileNext) && (
            <MonthNav type="button" $side="right" $mobileOnly={nav.mobileNext} onClick={() => setStart((s) => s + 1)} disabled={abs >= max} aria-label="Next month">
              <ChevronRight size={16} />
            </MonthNav>
          )}
        </MonthHead>
        <Grid role="group" aria-label={`${MONTHS[month]} ${year}`}>
          {WEEKDAYS.map((w) => (
            <WeekdayCell key={w} aria-hidden>{w}</WeekdayCell>
          ))}
          {Array.from({ length: firstDow }, (_, i) => (
            <Empty key={`e${i}`} />
          ))}
          {Array.from({ length: count }, (_, i) => {
            const d = i + 1;
            const key = cellKey(year, month, d);
            const day = days.get(key);
            const available = !!day && day.remaining > 0;
            const dow = (firstDow + i) % 7;
            const label = `${WEEKDAY_NAMES[dow]} ${d} ${MONTHS[month]}, ${
              available ? `${day.slots} ${day.slots === 1 ? "time" : "times"} available` : day ? "sold out" : "not available"
            }`;
            return (
              <DayCell
                key={key}
                type="button"
                $available={available}
                $selected={selected === key}
                disabled={!available}
                aria-pressed={selected === key}
                aria-label={label}
                onClick={() => onSelect(key)}
              >
                {d}
              </DayCell>
            );
          })}
        </Grid>
      </Month>
    );
  };

  return (
    <Popover id={id} role="dialog" aria-label="Choose a date">
      <Head>
        <div>
          <HeadTitle>{selected ? formatDayKey(selected) : "Select a date"}</HeadTitle>
          <HeadSub>
            {info
              ? `${info.slots} ${info.slots === 1 ? "time" : "times"} available · from ${Math.round(info.fromPrice)} lei`
              : "Days with a dot have places free"}
          </HeadSub>
        </div>
        <DateChip $active={!!selected}>
          <div>
            <span>DATE</span>
            <span>{selected ? selected.split("-").reverse().join("/") : "Any day"}</span>
          </div>
          {selected && (
            <ChipClear type="button" onClick={() => onSelect(null)} aria-label="Clear date">
              <X size={16} />
            </ChipClear>
          )}
        </DateChip>
      </Head>
      <Months>
        {renderMonth(start, { prev: true, mobileNext: true })}
        {renderMonth(start + 1, { next: true })}
      </Months>
      <Bottom>
        <Legend><i aria-hidden /> Places free</Legend>
        <Ctas>
          <ClearBtn type="button" onClick={() => onSelect(null)} disabled={!selected}>Clear date</ClearBtn>
          <CloseBtn type="button" onClick={onClose}>Close</CloseBtn>
        </Ctas>
      </Bottom>
    </Popover>
  );
}
