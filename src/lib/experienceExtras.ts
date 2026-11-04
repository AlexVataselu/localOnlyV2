import type { ExperienceExtras, IncludedGroup } from "@/types/experience";

/**
 * Validation for the per-listing details hosts fill in. Input comes from the
 * create/edit forms; anything malformed is dropped rather than stored.
 */

const MAX_ITEMS = 20;
const MAX_TEXT = 300;
const MAX_LONG_TEXT = 2000;

function cleanList(value: unknown, max = MAX_ITEMS): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().slice(0, MAX_TEXT))
    .filter(Boolean)
    .slice(0, max);
}

function cleanText(value: unknown, max = MAX_LONG_TEXT): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim().slice(0, max);
  return text || null;
}

export function parseIncluded(value: unknown): IncludedGroup[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((g) => {
      const group = g as { title?: unknown; items?: unknown };
      return { title: typeof group?.title === "string" ? group.title.trim().slice(0, 60) : "", items: cleanList(group?.items, 12) };
    })
    .filter((g) => g.title && g.items.length > 0)
    .slice(0, 8);
}

/** Pick and validate the extras present in a request body (undefined = not sent, for partial updates). */
export function extrasFromBody(body: Record<string, unknown>): Partial<ExperienceExtras> {
  const out: Partial<ExperienceExtras> = {};
  if (body.included !== undefined) out.included = parseIncluded(body.included);
  if (body.toBring !== undefined) out.toBring = cleanList(body.toBring);
  if (body.guestRequirements !== undefined) out.guestRequirements = cleanList(body.guestRequirements);
  if (body.cancellationPolicy !== undefined) out.cancellationPolicy = cleanText(body.cancellationPolicy);
  if (body.languages !== undefined) out.languages = cleanList(body.languages, 8);
  if (body.whereDescription !== undefined) out.whereDescription = cleanText(body.whereDescription);
  if (body.availability !== undefined) out.availability = cleanList(body.availability, 12);
  return out;
}
