"use client";

import { FormEvent, useState, useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import {
  ACTIVITY_TYPES,
  TIME_OF_DAYS,
  DURATIONS,
  SPECIALS,
  ActivityType,
  TimeOfDay,
  Duration,
  Special,
} from "@/types/filters";

const Container = styled.div<{ $inModal?: boolean }>`
  width: 100%;
  padding: ${({ $inModal }) => ($inModal ? 0 : "2rem clamp(24px, 5vw, 80px)")};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const Form = styled.form<{ $inModal?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $inModal }) => ($inModal ? "0.75rem" : "1.5rem")};

  ${({ $inModal }) =>
    $inModal
      ? `
    & input, & textarea {
      padding: 0.625rem 0.875rem;
      font-size: 0.9375rem;
    }
  `
      : ""}
`;

const FormRow = styled.div<{ $cols4?: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }

  ${({ $cols4 }) =>
    $cols4
      ? `
    @media (min-width: 480px) {
      gap: 0.75rem;
    }
    @media (min-width: 900px) {
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }
  `
      : ""}
`;

const Field = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? "0.375rem" : "0.5rem")};
`;

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FieldHint = styled.span`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const TextArea = styled.textarea<{ $compact?: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  min-height: ${({ $compact }) => ($compact ? "64px" : "120px")};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.cardBackground};
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.accentText};
  font-size: 0.9rem;
`;

const SuccessMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const CheckboxGroup = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: ${({ $cols }) =>
    $cols != null ? `repeat(${Math.min($cols, 4)}, 1fr)` : "repeat(auto-fit, minmax(200px, 1fr))"};
  gap: 0.375rem 0.75rem;
  margin-top: 0.5rem;

  @media (min-width: 640px) {
    gap: 0.5rem 1rem;
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  cursor: pointer;
  padding: 0.5rem 0;
  min-height: 40px;
  border-radius: 8px;
  transition: background 0.2s ease;
  min-width: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  @media (min-width: 640px) {
    padding: 0.5rem;
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
  line-height: 1.35;
  min-width: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: normal;
`;

const RadioGroup = styled.div<{ $cols?: number }>`
  display: ${({ $cols }) => ($cols === 2 ? "grid" : "flex")};
  flex-direction: column;
  grid-template-columns: ${({ $cols }) => ($cols === 2 ? "repeat(2, 1fr)" : "none")};
  gap: 0.375rem 1rem;
  margin-top: 0.5rem;

  @media (min-width: 640px) {
    gap: 0.5rem 1rem;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem 1rem;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem 1rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }
`;

const FilterCard = styled.div<{ $compact?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: ${({ $compact }) => ($compact ? "0.75rem 0.875rem" : "1rem 1.25rem")};
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? "0.375rem" : "0.75rem")};
  min-width: 0;

  & ${CheckboxGroup}, & ${RadioGroup} {
    margin-top: 0;
  }

  ${({ $compact }) =>
    $compact
      ? `
    & ${CheckboxGroup}, & ${RadioGroup} {
      gap: 0.25rem 0.5rem;
    }
    & ${CheckboxContainer}, & ${RadioContainer} {
      min-height: 36px;
      padding: 0.375rem 0;
    }
    @media (min-width: 640px) {
      & ${CheckboxContainer}, & ${RadioContainer} {
        padding: 0.375rem;
      }
    }
  `
      : ""}
`;

const FilterCardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const RadioContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  cursor: pointer;
  padding: 0.5rem 0;
  min-height: 40px;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  @media (min-width: 640px) {
    padding: 0.5rem;
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
  line-height: 1.35;
  min-width: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: normal;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

type CreateExperiencePayload = {
  title: string;
  location: string;
  price: number;
  image?: string;
  images?: string[];
  description?: string;
  activityTypes?: ActivityType[];
  timeOfDays?: TimeOfDay[];
  duration?: Duration | null;
  specials?: Special[];
};

const GalleryDescRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
`;

const GalleryList = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? "0.375rem" : "0.5rem")};
  padding: ${({ $compact }) => ($compact ? "0.625rem" : "0.75rem")};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

const ImageRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const ImageInput = styled(Input)`
  flex: 1;
`;

const RemoveImageBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.accentText};
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const AddImageBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentText};
  }
`;

type ExperienceFormProps = {
  /** When provided, form is in modal mode: hide title/actions, use form id for external submit, padding 0. */
  onClose?: () => void;
  /** In modal mode, notifies parent of mutation.isPending for footer submit button. */
  onPendingChange?: (pending: boolean) => void;
};

export default function ExperienceForm({ onClose, onPendingChange }: ExperienceFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inModal = !!onClose;
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([""]);

  // Filter state
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [timeOfDays, setTimeOfDays] = useState<TimeOfDay[]>([]);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [specials, setSpecials] = useState<Special[]>([]);

  const mutation = useMutation({
    mutationFn: async (payload: CreateExperiencePayload) => {
      const { data } = await apiClient.post("/experiences", payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["experiences"] });
      setSuccess("Experience uploaded successfully!");
      setError(null);
      setTimeout(() => {
        onClose?.();
        router.push("/experiences");
      }, 800);
    },
    onError: (mutationError: unknown) => {
      console.error(mutationError);
      setError("Failed to create experience. Please try again.");
      setSuccess(null);
    },
  });

  useEffect(() => {
    onPendingChange?.(mutation.isPending);
  }, [mutation.isPending, onPendingChange]);

  const handleActivityTypeToggle = (activityType: ActivityType) => {
    setActivityTypes((prev) =>
      prev.includes(activityType)
        ? prev.filter((t) => t !== activityType)
        : [...prev, activityType]
    );
  };

  const handleTimeOfDayToggle = (timeOfDay: TimeOfDay) => {
    setTimeOfDays((prev) =>
      prev.includes(timeOfDay)
        ? prev.filter((t) => t !== timeOfDay)
        : [...prev, timeOfDay]
    );
  };

  const handleDurationChange = (newDuration: Duration) => {
    setDuration(newDuration === duration ? null : newDuration);
  };

  const handleSpecialToggle = (special: Special) => {
    setSpecials((prev) =>
      prev.includes(special)
        ? prev.filter((s) => s !== special)
        : [...prev, special]
    );
  };

  const addImageUrl = () => setImageUrls((p) => [...p, ""]);
  const removeImageUrl = (i: number) => setImageUrls((p) => (p.length <= 1 ? p : p.filter((_, j) => j !== i)));
  const setImageUrlAt = (i: number, v: string) => setImageUrls((p) => p.map((s, j) => (j === i ? v : s)));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const images = imageUrls.map((u) => u.trim()).filter(Boolean);

    const payload: CreateExperiencePayload = {
      title: String(formData.get("title") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      price: Number(formData.get("price")),
      images: images.length > 0 ? images : undefined,
      description: String(formData.get("description") ?? "").trim() || undefined,
      activityTypes: activityTypes.length > 0 ? activityTypes : undefined,
      timeOfDays: timeOfDays.length > 0 ? timeOfDays : undefined,
      duration: duration || undefined,
      specials: specials.length > 0 ? specials : undefined,
    };

    if (!payload.title || !payload.location || !Number.isFinite(payload.price)) {
      setError("Title, location and price are required.");
      setSuccess(null);
      return;
    }
    if (!images.length) {
      setError("At least one image URL is required.");
      setSuccess(null);
      return;
    }

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    if (onClose) onClose();
    else router.back();
  };

  return (
    <Container $inModal={inModal}>
      {!inModal && <Title>Upload an Experience</Title>}
      <Form id={inModal ? "upload-experience-form" : undefined} onSubmit={handleSubmit} $inModal={inModal}>
        {inModal ? (
          <FormRow $cols4>
            <Field $compact>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Sunset kayak tour" required disabled={mutation.isPending} />
            </Field>
            <Field $compact>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Lisbon, Portugal" required disabled={mutation.isPending} />
            </Field>
            <Field $compact>
              <Label htmlFor="price">Price per person (lei)</Label>
              <Input id="price" name="price" type="number" min="0" step="1" placeholder="150" required disabled={mutation.isPending} />
            </Field>
          </FormRow>
        ) : (
          <>
            <Field>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Sunset kayak tour" required disabled={mutation.isPending} />
            </Field>
            <Field>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="Lisbon, Portugal" required disabled={mutation.isPending} />
            </Field>
            <Field>
              <Label htmlFor="price">Price per person (lei)</Label>
              <Input id="price" name="price" type="number" min="0" step="1" placeholder="150" required disabled={mutation.isPending} />
            </Field>
          </>
        )}
        {inModal ? (
          <GalleryDescRow>
            <Field>
              <Label>Gallery images (URLs)</Label>
              <FieldHint>First image is the cover.</FieldHint>
              <GalleryList $compact>
                {imageUrls.map((url, i) => (
                  <ImageRow key={i}>
                    <ImageInput
                      type="url"
                      placeholder={i === 0 ? "https://..." : "https://..."}
                      value={url}
                      onChange={(e) => setImageUrlAt(i, e.target.value)}
                      disabled={mutation.isPending}
                    />
                    <RemoveImageBtn type="button" onClick={() => removeImageUrl(i)} disabled={mutation.isPending} aria-label="Remove image">
                      <Trash2 size={18} />
                    </RemoveImageBtn>
                  </ImageRow>
                ))}
              </GalleryList>
              <AddImageBtn type="button" onClick={addImageUrl} disabled={mutation.isPending}>
                <Plus size={18} /> Add image URL
              </AddImageBtn>
            </Field>
            <Field $compact>
              <Label htmlFor="description">Description</Label>
              <FieldHint>Optional.</FieldHint>
              <TextArea id="description" name="description" placeholder="Tell guests what makes this experience special" disabled={mutation.isPending} $compact />
            </Field>
          </GalleryDescRow>
        ) : (
          <>
            <Field>
              <Label>Gallery images (URLs)</Label>
              {imageUrls.map((url, i) => (
                <ImageRow key={i} style={{ marginTop: i > 0 ? "0.5rem" : 0 }}>
                  <ImageInput
                    type="url"
                    placeholder={i === 0 ? "https://... (first image is the cover)" : "https://..."}
                    value={url}
                    onChange={(e) => setImageUrlAt(i, e.target.value)}
                    disabled={mutation.isPending}
                  />
                  <RemoveImageBtn type="button" onClick={() => removeImageUrl(i)} disabled={mutation.isPending} aria-label="Remove image">
                    <Trash2 size={18} />
                  </RemoveImageBtn>
                </ImageRow>
              ))}
              <AddImageBtn type="button" onClick={addImageUrl} disabled={mutation.isPending}>
                <Plus size={18} /> Add image URL
              </AddImageBtn>
            </Field>
            <Field>
              <Label htmlFor="description">Description</Label>
              <TextArea id="description" name="description" placeholder="Tell guests what makes this experience special" disabled={mutation.isPending} />
            </Field>
          </>
        )}

        {inModal ? (
          <FilterGrid>
            <FilterCard $compact>
              <FilterCardTitle>Activity Type</FilterCardTitle>
              <CheckboxGroup $cols={2}>
                {ACTIVITY_TYPES.map((type) => (
                  <CheckboxContainer key={type}>
                    <CheckboxInput
                      type="checkbox"
                      checked={activityTypes.includes(type)}
                      onChange={() => handleActivityTypeToggle(type)}
                      disabled={mutation.isPending}
                    />
                    <CheckboxLabel>{type}</CheckboxLabel>
                  </CheckboxContainer>
                ))}
              </CheckboxGroup>
            </FilterCard>
            <FilterCard $compact>
              <FilterCardTitle>Time of Day</FilterCardTitle>
              <CheckboxGroup $cols={1}>
                {TIME_OF_DAYS.map((time) => (
                  <CheckboxContainer key={time}>
                    <CheckboxInput
                      type="checkbox"
                      checked={timeOfDays.includes(time)}
                      onChange={() => handleTimeOfDayToggle(time)}
                      disabled={mutation.isPending}
                    />
                    <CheckboxLabel>{time}</CheckboxLabel>
                  </CheckboxContainer>
                ))}
              </CheckboxGroup>
            </FilterCard>
            <FilterCard $compact>
              <FilterCardTitle>Duration</FilterCardTitle>
              <RadioGroup $cols={1}>
                {DURATIONS.map((dur) => (
                  <RadioContainer key={dur}>
                    <RadioInput
                      type="radio"
                      name="duration"
                      checked={duration === dur}
                      onChange={() => handleDurationChange(dur)}
                      disabled={mutation.isPending}
                    />
                    <RadioLabel>{dur}</RadioLabel>
                  </RadioContainer>
                ))}
              </RadioGroup>
            </FilterCard>
            <FilterCard $compact>
              <FilterCardTitle>Specials</FilterCardTitle>
              <CheckboxGroup $cols={2}>
                {SPECIALS.map((special) => (
                  <CheckboxContainer key={special}>
                    <CheckboxInput
                      type="checkbox"
                      checked={specials.includes(special)}
                      onChange={() => handleSpecialToggle(special)}
                      disabled={mutation.isPending}
                    />
                    <CheckboxLabel>{special}</CheckboxLabel>
                  </CheckboxContainer>
                ))}
              </CheckboxGroup>
            </FilterCard>
          </FilterGrid>
        ) : (
          <>
            <SectionTitle>Activity Type</SectionTitle>
            <CheckboxGroup>
              {ACTIVITY_TYPES.map((type) => (
                <CheckboxContainer key={type}>
                  <CheckboxInput
                    type="checkbox"
                    checked={activityTypes.includes(type)}
                    onChange={() => handleActivityTypeToggle(type)}
                    disabled={mutation.isPending}
                  />
                  <CheckboxLabel>{type}</CheckboxLabel>
                </CheckboxContainer>
              ))}
            </CheckboxGroup>

            <SectionTitle>Time of Day</SectionTitle>
            <CheckboxGroup>
              {TIME_OF_DAYS.map((time) => (
                <CheckboxContainer key={time}>
                  <CheckboxInput
                    type="checkbox"
                    checked={timeOfDays.includes(time)}
                    onChange={() => handleTimeOfDayToggle(time)}
                    disabled={mutation.isPending}
                  />
                  <CheckboxLabel>{time}</CheckboxLabel>
                </CheckboxContainer>
              ))}
            </CheckboxGroup>

            <SectionTitle>Duration</SectionTitle>
            <RadioGroup>
              {DURATIONS.map((dur) => (
                <RadioContainer key={dur}>
                  <RadioInput
                    type="radio"
                    name="duration"
                    checked={duration === dur}
                    onChange={() => handleDurationChange(dur)}
                    disabled={mutation.isPending}
                  />
                  <RadioLabel>{dur}</RadioLabel>
                </RadioContainer>
              ))}
            </RadioGroup>

            <SectionTitle>Specials</SectionTitle>
            <CheckboxGroup>
              {SPECIALS.map((special) => (
                <CheckboxContainer key={special}>
                  <CheckboxInput
                    type="checkbox"
                    checked={specials.includes(special)}
                    onChange={() => handleSpecialToggle(special)}
                    disabled={mutation.isPending}
                  />
                  <CheckboxLabel>{special}</CheckboxLabel>
                </CheckboxContainer>
              ))}
            </CheckboxGroup>
          </>
        )}

        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
        {success && <SuccessMessage role="status">{success}</SuccessMessage>}
        {!inModal && (
          <Actions>
            <SubmitButton type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Uploading..." : "Upload"}
            </SubmitButton>
            <CancelButton type="button" onClick={handleCancel} disabled={mutation.isPending}>
              Cancel
            </CancelButton>
          </Actions>
        )}
      </Form>
    </Container>
  );
}


