"use client";

import { useEffect, useId, useRef, useState } from "react";
import styled from "styled-components";
import { ChevronDown } from "lucide-react";

export const FilterPill = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.surfaceRaised)};
  color: ${({ theme, $active }) => ($active ? theme.colors.onAccent : theme.colors.textPrimary)};
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  svg {
    flex-shrink: 0;
  }
`;

const Wrap = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const Panel = styled.fieldset`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 1100;
  min-width: 220px;
  margin: 0;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  box-shadow: ${({ theme }) => theme.shadows.cardHover};

  legend {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
`;

const Option = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px;
  padding: 0 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.surface : "transparent")};

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  input {
    width: 18px;
    height: 18px;
    margin: 0;
    accent-color: ${({ theme }) => theme.colors.accent};
  }
`;

export interface DropdownOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  /** Highlight the pill when a non-default option is chosen. */
  active: boolean;
}

/** Pill that opens a radio group. Escape or an outside click closes it. */
export default function FilterDropdown({ label, value, options, onSelect, active }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <Wrap ref={wrapRef}>
      <FilterPill
        ref={buttonRef}
        type="button"
        $active={active}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((v) => !v)}
      >
        {active && selected ? selected.label : label}
        <ChevronDown size={16} aria-hidden />
      </FilterPill>
      {open && (
        <Panel id={`${id}-panel`}>
          <legend>{label}</legend>
          {options.map((option) => (
            <Option key={option.value} $selected={option.value === value}>
              <input
                type="radio"
                name={`${id}-radio`}
                value={option.value}
                checked={option.value === value}
                onChange={() => {
                  onSelect(option.value);
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
              />
              {option.label}
            </Option>
          ))}
        </Panel>
      )}
    </Wrap>
  );
}
