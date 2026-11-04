"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useQueryClient } from "@tanstack/react-query";
import { Button, SecondaryButton } from "@/components/ui/Status";
import { ClientApiError, request } from "@/lib/api/client";
import { IMAGE_HOSTS, isAllowedImageUrl } from "@/lib/images";
import type { Experience, ExperienceInput } from "@/types/experience";
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPES,
  type ActivityType,
  type Duration,
  DURATION_LABELS,
  DURATIONS,
  type Special,
  SPECIAL_LABELS,
  SPECIALS,
  TIME_OF_DAY_LABELS,
  TIME_OF_DAYS,
  type TimeOfDay,
} from "@/types/filters";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 760px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-weight: 700;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const inputStyles = `
  width: 100%;
  min-height: 48px;
  padding: 0.7rem 1rem;
  border-radius: 12px;
  font-size: 1rem;
`;

const Input = styled.input`
  ${inputStyles}
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.textPrimary};

  &[aria-invalid="true"] {
    border-color: ${({ theme }) => theme.colors.danger};
  }
`;

const TextArea = styled.textarea`
  ${inputStyles}
  min-height: 160px;
  resize: vertical;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.textPrimary};

  &[aria-invalid="true"] {
    border-color: ${({ theme }) => theme.colors.danger};
  }
`;

const Help = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FieldError = styled.p`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.danger};
`;

const Group = styled.fieldset`
  margin: 0;
  padding: 0;
  border: none;

  legend {
    padding: 0;
    margin-bottom: 0.6rem;
    font-weight: 700;
  }
`;

const ChoiceGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Choice = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  cursor: pointer;
  font-weight: 600;

  input {
    position: absolute;
    opacity: 0;
    inset: 0;
    margin: 0;
    cursor: pointer;
  }

  &:has(input:checked) {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.onAccent};
  }

  &:has(input:focus-visible) {
    outline: 2px solid ${({ theme }) => theme.colors.focus};
    outline-offset: 2px;
  }
`;

const Preview = styled.div`
  position: relative;
  aspect-ratio: 3 / 2;
  max-width: 360px;
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
`;

const Banner = styled.p<{ $tone: "error" | "ok" }>`
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme, $tone }) => ($tone === "error" ? theme.colors.danger : theme.colors.accent)};
  background: ${({ theme, $tone }) => ($tone === "error" ? theme.colors.dangerSurface : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const CancelLink = styled(SecondaryButton).attrs({ as: Link })``;

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

interface ExperienceFormProps {
  /** Present when editing. */
  experience?: Experience;
}

export default function ExperienceForm({ experience }: ExperienceFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const editing = Boolean(experience);

  const [image, setImage] = useState(experience?.image ?? "");
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>(experience?.activityTypes ?? []);
  const [timeOfDays, setTimeOfDays] = useState<TimeOfDay[]>(experience?.timeOfDays ?? []);
  const [duration, setDuration] = useState<Duration | null>(experience?.duration ?? null);
  const [specials, setSpecials] = useState<Special[]>(experience?.specials ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fieldProps = (name: string) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : `${name}-help`,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload: ExperienceInput = {
      title: String(data.get("title") ?? "").trim(),
      location: String(data.get("location") ?? "").trim(),
      price: Number(data.get("price")),
      image: image.trim(),
      description: String(data.get("description") ?? "").trim() || null,
      activityTypes,
      timeOfDays,
      duration,
      specials,
    };

    const local: Record<string, string> = {};
    if (payload.title.length < 3) local.title = "Give it a title of at least 3 characters.";
    if (payload.location.length < 2) local.location = "Where does it happen?";
    if (!Number.isInteger(payload.price) || payload.price < 0) local.price = "Enter a whole number of lei, 0 or more.";
    if (!isAllowedImageUrl(payload.image)) local.image = `Use an https link from ${IMAGE_HOSTS.join(", ")}.`;
    setErrors(local);
    if (Object.keys(local).length) {
      setFormError("Some fields need attention.");
      document.getElementById(Object.keys(local)[0])?.focus();
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const saved = await request<Experience>(
        editing ? `/experiences/${encodeURIComponent(experience!.id)}` : "/experiences",
        { method: editing ? "PATCH" : "POST", body: payload },
      );
      await queryClient.invalidateQueries({ queryKey: ["experiences"] });
      await queryClient.invalidateQueries({ queryKey: ["hosts"] });
      router.push(`/experiences/${encodeURIComponent(saved.id)}`);
      router.refresh();
    } catch (error) {
      setSaving(false);
      if (error instanceof ClientApiError) {
        setErrors(error.fieldErrors());
        setFormError(error.message);
      } else {
        setFormError("Couldn't save. Please try again.");
      }
    }
  };

  const showPreview = isAllowedImageUrl(image);

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <Field>
        <label htmlFor="title">Title</label>
        <Input id="title" name="title" defaultValue={experience?.title} placeholder="Sunrise ridge hike in the Bucegi" required maxLength={120} {...fieldProps("title")} />
        {errors.title ? <FieldError id="title-error">{errors.title}</FieldError> : <Help id="title-help">What guests will do, in a few words.</Help>}
      </Field>

      <Row>
        <Field>
          <label htmlFor="location">Location</label>
          <Input id="location" name="location" defaultValue={experience?.location} placeholder="Azuga, Prahova" required maxLength={120} {...fieldProps("location")} />
          {errors.location ? <FieldError id="location-error">{errors.location}</FieldError> : <Help id="location-help">Town and county.</Help>}
        </Field>
        <Field>
          <label htmlFor="price">Price per person (lei)</label>
          <Input id="price" name="price" type="number" inputMode="numeric" min={0} step={1} defaultValue={experience?.price} placeholder="220" required {...fieldProps("price")} />
          {errors.price ? <FieldError id="price-error">{errors.price}</FieldError> : <Help id="price-help">Whole lei, in RON.</Help>}
        </Field>
      </Row>

      <Field>
        <label htmlFor="image">Cover photo URL</label>
        <Input id="image" name="image" type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://images.unsplash.com/photo-…" required {...fieldProps("image")} />
        {errors.image ? (
          <FieldError id="image-error">{errors.image}</FieldError>
        ) : (
          <Help id="image-help">An https link from {IMAGE_HOSTS.join(", ")}.</Help>
        )}
        {showPreview && (
          <Preview>
            <Image src={image} alt="Cover photo preview" fill sizes="360px" style={{ objectFit: "cover" }} />
          </Preview>
        )}
      </Field>

      <Field>
        <label htmlFor="description">Description</label>
        <TextArea id="description" name="description" defaultValue={experience?.description ?? ""} placeholder="What happens, what's included, how fit guests need to be…" maxLength={5000} {...fieldProps("description")} />
        {errors.description ? <FieldError id="description-error">{errors.description}</FieldError> : <Help id="description-help">Optional, but listings with a description get more interest.</Help>}
      </Field>

      <Group>
        <legend>Activity type</legend>
        <ChoiceGrid>
          {ACTIVITY_TYPES.map((value) => (
            <Choice key={value}>
              <input type="checkbox" checked={activityTypes.includes(value)} onChange={() => setActivityTypes((l) => toggle(l, value))} />
              {ACTIVITY_TYPE_LABELS[value]}
            </Choice>
          ))}
        </ChoiceGrid>
      </Group>

      <Group>
        <legend>Time of day</legend>
        <ChoiceGrid>
          {TIME_OF_DAYS.map((value) => (
            <Choice key={value}>
              <input type="checkbox" checked={timeOfDays.includes(value)} onChange={() => setTimeOfDays((l) => toggle(l, value))} />
              {TIME_OF_DAY_LABELS[value]}
            </Choice>
          ))}
        </ChoiceGrid>
      </Group>

      <Group>
        <legend>Duration</legend>
        <ChoiceGrid>
          {DURATIONS.map((value) => (
            <Choice key={value}>
              <input type="radio" name="duration" checked={duration === value} onChange={() => setDuration(value)} onClick={() => duration === value && setDuration(null)} />
              {DURATION_LABELS[value]}
            </Choice>
          ))}
        </ChoiceGrid>
      </Group>

      <Group>
        <legend>Extras</legend>
        <ChoiceGrid>
          {SPECIALS.map((value) => (
            <Choice key={value}>
              <input type="checkbox" checked={specials.includes(value)} onChange={() => setSpecials((l) => toggle(l, value))} />
              {SPECIAL_LABELS[value]}
            </Choice>
          ))}
        </ChoiceGrid>
      </Group>

      {formError && (
        <Banner $tone="error" role="alert">
          {formError}
        </Banner>
      )}

      <Actions>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Publish experience"}
        </Button>
        <CancelLink href={editing ? `/experiences/${encodeURIComponent(experience!.id)}` : "/experiences"}>Cancel</CancelLink>
      </Actions>
    </Form>
  );
}
