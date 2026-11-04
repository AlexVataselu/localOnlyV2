"use client";

import styled from "styled-components";
import { Star } from "lucide-react";
import { formatRating } from "@/utils/formatters";

const Wrap = styled.span<{ $size: "sm" | "md" }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: ${({ $size }) => ($size === "md" ? "1.05rem" : "0.9rem")};
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;

  svg {
    color: ${({ theme }) => theme.colors.star};
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 700;
  }
`;

const NewBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentText};
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

/** One star + number + count. Shows "New" until there are reviews. */
export default function Rating({
  rating,
  count,
  size = "sm",
}: {
  rating: number | null;
  count: number;
  size?: "sm" | "md";
}) {
  if (rating === null || count === 0) return <NewBadge>New</NewBadge>;
  return (
    <Wrap $size={size} aria-label={`Rated ${formatRating(rating)} out of 5 from ${count} reviews`}>
      <Star size={size === "md" ? 18 : 15} fill="currentColor" aria-hidden />
      <strong aria-hidden>{formatRating(rating)}</strong>
      <span aria-hidden>({count})</span>
    </Wrap>
  );
}
