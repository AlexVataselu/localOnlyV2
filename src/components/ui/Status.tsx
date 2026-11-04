"use client";

import type { ReactNode } from "react";
import styled, { keyframes } from "styled-components";

const Box = styled.div<{ $tone: "neutral" | "error" }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1.5rem;
  border-radius: 16px;
  text-align: center;
  border: 1px solid ${({ theme, $tone }) => ($tone === "error" ? theme.colors.danger : theme.colors.border)};
  background: ${({ theme, $tone }) => ($tone === "error" ? theme.colors.dangerSurface : theme.colors.surface)};
  color: ${({ theme }) => theme.colors.textPrimary};

  p {
    margin: 0;
    max-width: 48ch;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  strong {
    font-size: 1.1rem;
  }
`;

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 1.25rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }
`;

export const SecondaryButton = styled(Button)`
  background: transparent;
  border-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surface};
    border-color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export function ErrorState({ title = "Something went wrong", message, onRetry }: { title?: string; message?: string; onRetry?: () => void }) {
  return (
    <Box $tone="error" role="alert">
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {onRetry && (
        <Button type="button" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Box>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Box $tone="neutral">
      <strong>{title}</strong>
      {children}
    </Box>
  );
}

const pulse = keyframes`
  from { opacity: 0.55; }
  to { opacity: 1; }
`;

/** Placeholder block shaped like the content it stands in for. */
export const Skeleton = styled.div<{ $height?: string }>`
  height: ${({ $height }) => $height ?? "100%"};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (prefers-reduced-motion: no-preference) {
    animation: ${pulse} 1.1s ease-in-out infinite alternate;
  }
`;
