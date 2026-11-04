"use client";

import { useId, useState } from "react";
import styled from "styled-components";
import type { ExperienceExtras, IncludedGroup } from "@/types/experience";

/**
 * The per-listing details shown on the experience page (what's included, what
 * to bring, guest requirements, cancellation policy, languages, where you'll
 * be, available dates). Used by both the create form and the inline edit form.
 * Lists are typed one item per line; "What's included" as "Category: a, b".
 */

const Fieldset = styled.fieldset`
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  legend {
    padding: 0;
    margin-bottom: 0.25rem;
    font-size: 1.05rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.95rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const Hint = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const inputBase = `
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: inherit;
`;

const TextArea = styled.textarea`
  ${inputBase}
  min-height: 96px;
  resize: vertical;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Input = styled.input`
  ${inputBase}
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const lines = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export const includedToText = (groups: IncludedGroup[]) => groups.map((g) => `${g.title}: ${g.items.join(", ")}`).join("\n");

export const textToIncluded = (text: string): IncludedGroup[] =>
  lines(text)
    .map((line) => {
      const colon = line.indexOf(":");
      const title = colon === -1 ? line : line.slice(0, colon);
      const rest = colon === -1 ? "" : line.slice(colon + 1);
      return {
        title: title.trim(),
        items: rest
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      };
    })
    .filter((g) => g.title && g.items.length > 0);

interface Props {
  value: ExperienceExtras;
  onChange: (next: ExperienceExtras) => void;
  disabled?: boolean;
}

export default function ExperienceExtrasFields({ value, onChange, disabled }: Props) {
  const id = useId();
  // "What's included" and languages are edited as free text and parsed on change.
  const [includedText, setIncludedText] = useState(() => includedToText(value.included));
  const [languagesText, setLanguagesText] = useState(() => value.languages.join(", "));
  const set = <K extends keyof ExperienceExtras>(key: K, v: ExperienceExtras[K]) => onChange({ ...value, [key]: v });

  return (
    <Fieldset disabled={disabled}>
      <legend>Listing details</legend>
      <Hint>Optional. Each section appears on your experience page only when it has content.</Hint>
      <Field>
        <label htmlFor={`${id}-included`}>What&apos;s included</label>
        <TextArea
          id={`${id}-included`}
          value={includedText}
          placeholder={"Gear: E-bike, Helmet\nFood: Soup, Sandwich"}
          onChange={(e) => {
            setIncludedText(e.target.value);
            set("included", textToIncluded(e.target.value));
          }}
        />
        <Hint>One category per line: &quot;Category: item, item&quot;.</Hint>
      </Field>
      <Grid>
        <Field>
          <label htmlFor={`${id}-bring`}>What to bring</label>
          <TextArea
            id={`${id}-bring`}
            value={value.toBring.join("\n")}
            placeholder={"Hiking shoes\nRain jacket"}
            onChange={(e) => set("toBring", lines(e.target.value))}
          />
          <Hint>One item per line.</Hint>
        </Field>
        <Field>
          <label htmlFor={`${id}-req`}>Guest requirements</label>
          <TextArea
            id={`${id}-req`}
            value={value.guestRequirements.join("\n")}
            placeholder={"Ages 14 and up\nUp to 6 guests"}
            onChange={(e) => set("guestRequirements", lines(e.target.value))}
          />
          <Hint>One per line.</Hint>
        </Field>
      </Grid>
      <Field>
        <label htmlFor={`${id}-cancel`}>Cancellation policy</label>
        <TextArea
          id={`${id}-cancel`}
          value={value.cancellationPolicy ?? ""}
          placeholder="Full refund if you cancel at least 48 hours before the start."
          onChange={(e) => set("cancellationPolicy", e.target.value || null)}
        />
      </Field>
      <Field>
        <label htmlFor={`${id}-where`}>Where you&apos;ll be</label>
        <TextArea
          id={`${id}-where`}
          value={value.whereDescription ?? ""}
          placeholder="We meet at the Azuga gondola and ride the forest trails above the town."
          onChange={(e) => set("whereDescription", e.target.value || null)}
        />
      </Field>
      <Grid>
        <Field>
          <label htmlFor={`${id}-lang`}>Languages</label>
          <Input
            id={`${id}-lang`}
            value={languagesText}
            placeholder="English, Romanian"
            onChange={(e) => {
              setLanguagesText(e.target.value);
              set(
                "languages",
                e.target.value
                  .split(",")
                  .map((l) => l.trim())
                  .filter(Boolean),
              );
            }}
          />
          <Hint>Separate with commas.</Hint>
        </Field>
        <Field>
          <label htmlFor={`${id}-dates`}>Available dates</label>
          <TextArea
            id={`${id}-dates`}
            value={value.availability.join("\n")}
            placeholder={"Sat, 14 Jun · 09:00–13:00\nSun, 15 Jun · 09:00–13:00"}
            onChange={(e) => set("availability", lines(e.target.value))}
          />
          <Hint>One slot per line.</Hint>
        </Field>
      </Grid>
    </Fieldset>
  );
}
