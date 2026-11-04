"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import styled from "styled-components";

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button<{ $isActive: boolean; $isOpen: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme, $isActive }) => 
    $isActive ? theme.colors.accent : theme.colors.border};
  background: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.accent : theme.colors.background};
  color: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.onAccent : theme.colors.textPrimary};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme, $isActive }) => 
      $isActive ? theme.colors.accent : theme.colors.surface};
  }
`;

const ChevronIcon = styled.span<{ $isOpen: boolean }>`
  display: inline-block;
  width: 16px;
  height: 16px;
  position: relative;
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: translate(-50%, -60%) rotate(45deg);
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean; $alignRight?: boolean }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  /* Opens leftwards when there's no room on the right (phones). */
  ${({ $alignRight }) => ($alignRight ? "right: 0;" : "left: 0;")}
  min-width: 200px;
  max-width: calc(100vw - 32px);
  /* Closed menus leave the layout, so they can't widen the page. */
  display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transform: ${({ $isOpen }) => ($isOpen ? "translateY(0)" : "translateY(-8px)")};
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
  padding: 0.5rem;
`;

const DropdownItem = styled.button<{ $isSelected: boolean }>`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  border: none;
  background: ${({ theme, $isSelected }) => 
    $isSelected ? theme.colors.surface : "transparent"};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  &:not(:last-child) {
    margin-bottom: 0.25rem;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const RadioOption = styled.label<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  background: ${({ theme, $isSelected }) => 
    $isSelected ? theme.colors.surface : "transparent"};
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  input[type="radio"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: ${({ theme }) => theme.colors.accent};
  }

  span {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

interface DropdownOption {
  label: string;
  value: string | number | [number, number];
}

interface FilterDropdownProps {
  label: string;
  value?: string;
  options: DropdownOption[];
  onSelect: (value: string | number | [number, number]) => void;
  isActive?: boolean;
}

export default function FilterDropdown({
  label,
  value,
  options,
  onSelect,
  isActive = false,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggle = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setAlignRight(rect.left + 216 > window.innerWidth);
    setIsOpen(!isOpen);
  };

  const selectedLabel = useMemo(() => {
    if (!value) return label;
    const found = options.find((opt) => {
      if (Array.isArray(opt.value)) {
        return false; // Price ranges need special handling
      }
      return String(opt.value) === String(value);
    });
    return found?.label || label;
  }, [value, options, label]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string | number | [number, number]) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={containerRef}>
      <DropdownButton
        type="button"
        $isActive={isActive}
        $isOpen={isOpen}
        onClick={toggle}
      >
        {selectedLabel}
        <ChevronIcon $isOpen={isOpen} />
      </DropdownButton>
      <DropdownMenu $isOpen={isOpen} $alignRight={alignRight}>
        {options.map((option) => (
          <DropdownItem
            key={String(option.value)}
            type="button"
            $isSelected={
              Array.isArray(option.value)
                ? false // Price ranges handled separately
                : String(option.value) === String(value)
            }
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </DropdownContainer>
  );
}

interface FilterRadioDropdownProps {
  label: string;
  value?: string;
  options: DropdownOption[];
  onSelect: (value: string | number | [number, number]) => void;
  isActive?: boolean;
}

export function FilterRadioDropdown({
  label,
  value,
  options,
  onSelect,
  isActive = false,
}: FilterRadioDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggle = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setAlignRight(rect.left + 216 > window.innerWidth);
    setIsOpen(!isOpen);
  };

  const selectedLabel = value
    ? options.find((opt) => 
        typeof opt.value === "string" 
          ? opt.value === value
          : false
      )?.label || label
    : label;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string | number | [number, number]) => {
    onSelect(optionValue);
    setIsOpen(false);
  };

  return (
    <DropdownContainer ref={containerRef}>
      <DropdownButton
        type="button"
        $isActive={isActive}
        $isOpen={isOpen}
        onClick={toggle}
      >
        {selectedLabel}
        <ChevronIcon $isOpen={isOpen} />
      </DropdownButton>
      <DropdownMenu $isOpen={isOpen} $alignRight={alignRight}>
        <RadioGroup>
          {options.map((option) => (
            <RadioOption
              key={String(option.value)}
              $isSelected={
                typeof option.value === "string" ? option.value === value : false
              }
            >
              <input
                type="radio"
                name={label}
                checked={
                  typeof option.value === "string" ? option.value === value : false
                }
                onChange={() => handleSelect(option.value)}
              />
              <span>{option.label}</span>
            </RadioOption>
          ))}
        </RadioGroup>
      </DropdownMenu>
    </DropdownContainer>
  );
}
