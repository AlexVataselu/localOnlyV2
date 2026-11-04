"use client";

import { type FormEvent, useId } from "react";
import styled, { css } from "styled-components";
import { MapPin, Search } from "lucide-react";
import type { SearchParams } from "@/types/search";

/**
 * Where + what search pill. Controlled: the experiences page filters live as
 * the visitor types (`onChange`), the header navigates on submit (`onSearch`).
 */

type Variant = "hero" | "compact";

const Form = styled.form<{ $variant: Variant }>`
  display: flex;
  align-items: stretch;
  width: 100%;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.shadows.card};
  overflow: hidden;

  @media (prefers-reduced-motion: no-preference) {
    transition: border-color 0.2s;
  }

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  ${({ $variant }) =>
    $variant === "hero" &&
    css`
      max-width: 720px;
      min-height: 64px;

      @media (max-width: 560px) {
        flex-direction: column;
        border-radius: 20px;
      }
    `}
`;

const Field = styled.label<{ $grow?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: ${({ $grow }) => ($grow ? "1 1 55%" : "1 1 45%")};
  min-width: 0;
  min-height: 46px;
  padding: 0 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: text;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.colors.border};
  }

  @media (max-width: 560px) {
    padding: 0 0.75rem;
  }
`;

const Input = styled.input`
  width: 100%;
  min-width: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  font-size: 0.95rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  /* The whole pill shows focus via :focus-within. */
  &:focus-visible {
    outline: none;
  }

  &::-webkit-search-cancel-button {
    cursor: pointer;
  }
`;

const Submit = styled.button<{ $variant: Variant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
  margin: 0.2rem;
  padding: 0 ${({ $variant }) => ($variant === "hero" ? "1.5rem" : "0.8rem")};
  border: none;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-weight: 700;
  cursor: pointer;

  @media (prefers-reduced-motion: no-preference) {
    transition: background 0.2s, transform 0.15s;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:active {
    transform: scale(0.96);
  }
`;

export interface SearchBarProps {
  value: SearchParams;
  onChange: (v: SearchParams) => void;
  onSearch: (v: SearchParams) => void;
  variant?: Variant;
}

export default function SearchBar({ value, onChange, onSearch, variant = "compact" }: SearchBarProps) {
  const id = useId();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch({ ...value, location: value.location.trim(), experience: value.experience.trim() });
  };

  return (
    <Form role="search" aria-label="Search experiences" onSubmit={handleSubmit} $variant={variant}>
      <Field htmlFor={`${id}-where`}>
        <MapPin size={18} aria-hidden />
        <span className="visually-hidden">Where</span>
        <Input
          id={`${id}-where`}
          name="location"
          placeholder="Where?"
          autoComplete="off"
          value={value.location}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
        />
      </Field>
      <Field htmlFor={`${id}-what`} $grow>
        <Search size={18} aria-hidden />
        <span className="visually-hidden">What</span>
        <Input
          id={`${id}-what`}
          name="experience"
          type="search"
          placeholder="What?"
          autoComplete="off"
          value={value.experience}
          onChange={(e) => onChange({ ...value, experience: e.target.value })}
        />
      </Field>
      <Submit type="submit" $variant={variant} aria-label={variant === "hero" ? undefined : "Search"}>
        <Search size={18} aria-hidden />
        {variant === "hero" && <span>Search</span>}
      </Submit>
    </Form>
  );
}
