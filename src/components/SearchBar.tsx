"use client";

import { type FormEvent, useId, useState } from "react";
import styled, { css } from "styled-components";
import { MapPin, Search } from "lucide-react";

export interface SearchValues {
  location: string;
  q: string;
}

const Form = styled.form<{ $variant: "hero" | "compact" }>`
  display: flex;
  align-items: stretch;
  width: 100%;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  box-shadow: ${({ theme }) => theme.shadows.card};
  overflow: hidden;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  ${({ $variant }) =>
    $variant === "hero" &&
    css`
      max-width: 720px;
      min-height: 64px;
    `}

  @media (max-width: 560px) {
    flex-direction: column;
    border-radius: 20px;
  }
`;

const Field = styled.label<{ $grow?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: ${({ $grow }) => ($grow ? "1 1 55%" : "1 1 45%")};
  min-width: 0;
  min-height: 48px;
  padding: 0 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: text;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.colors.border};
  }

  @media (max-width: 560px) {
    & + & {
      border-left: none;
      border-top: 1px solid ${({ theme }) => theme.colors.border};
    }
  }
`;

const Input = styled.input`
  width: 100%;
  min-width: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  /* The whole pill shows focus via :focus-within. */
  &:focus-visible {
    outline: none;
  }
`;

const Submit = styled.button<{ $variant: "hero" | "compact" }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
  min-width: 48px;
  min-height: 48px;
  margin: 0.25rem;
  padding: 0 ${({ $variant }) => ($variant === "hero" ? "1.5rem" : "0.9rem")};
  border: none;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }
`;

interface SearchBarProps {
  defaultValues?: Partial<SearchValues>;
  onSubmit: (values: SearchValues) => void;
  variant?: "hero" | "compact";
}

export default function SearchBar({ defaultValues, onSubmit, variant = "compact" }: SearchBarProps) {
  const [location, setLocation] = useState(defaultValues?.location ?? "");
  const [q, setQ] = useState(defaultValues?.q ?? "");
  const id = useId();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit({ location: location.trim(), q: q.trim() });
  };

  return (
    <Form role="search" aria-label="Search experiences" onSubmit={handleSubmit} $variant={variant}>
      <Field htmlFor={`${id}-where`}>
        <MapPin size={18} aria-hidden />
        <span className="visually-hidden">Where</span>
        <Input
          id={`${id}-where`}
          name="location"
          placeholder="Where? e.g. Azuga"
          autoComplete="off"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </Field>
      <Field htmlFor={`${id}-what`} $grow>
        <Search size={18} aria-hidden />
        <span className="visually-hidden">What</span>
        <Input
          id={`${id}-what`}
          name="q"
          type="search"
          placeholder="What? e.g. hiking, cooking"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </Field>
      <Submit type="submit" $variant={variant} aria-label={variant === "hero" ? undefined : "Search"}>
        <Search size={18} aria-hidden />
        {variant === "hero" && <span>Search</span>}
      </Submit>
    </Form>
  );
}
