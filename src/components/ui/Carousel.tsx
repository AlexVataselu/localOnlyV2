"use client";

import { Children, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading, { Section } from "./SectionHeading";

/**
 * A titled section with a horizontal list on native scrolling: swipeable on
 * touch, scrollable by trackpad or keyboard, snap-aligned. The arrow buttons
 * are a convenience for mouse users and disable themselves at either end.
 */

const Viewport = styled.ul<{ $itemWidth: string }>`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: ${({ $itemWidth }) => $itemWidth};
  gap: 1.25rem;
  margin: 0;
  padding: 0.25rem 0.25rem 1rem;
  list-style: none;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 0.25rem;
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.colors.border} transparent`};

  & > li {
    scroll-snap-align: start;
    min-width: 0;
  }
`;

const Buttons = styled.div`
  display: inline-flex;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.accent};
`;

const ArrowButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  cursor: pointer;

  & + & {
    border-left: 1px solid ${({ theme }) => theme.colors.onAccent}33;
  }

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: default;
  }
`;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface CarouselProps {
  headingId: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Extra controls next to the arrows, e.g. a "Show all" link. */
  actions?: ReactNode;
  /** Accessible name of the list. */
  label: string;
  itemWidth?: string;
  /** Rendered instead of the list (loading, error, empty). */
  fallback?: ReactNode;
  /** Drop the page gutters when the carousel sits inside an already padded layout. */
  flush?: boolean;
  children?: ReactNode;
}

export default function Carousel({
  headingId,
  title,
  lead,
  actions,
  label,
  itemWidth = "min(320px, 82vw)",
  fallback,
  flush = false,
  children,
}: CarouselProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const count = Children.count(children);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
    };
    el.addEventListener("scroll", measure, { passive: true });
    // ResizeObserver also fires once on observe, which gives the initial measurement.
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [count, fallback]);

  const scroll = useCallback((direction: 1 | -1) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  const scrollable = !fallback && !(edges.start && edges.end);

  return (
    <Section aria-labelledby={headingId} style={flush ? { paddingInline: 0 } : undefined}>
      <SectionHeading
        id={headingId}
        title={title}
        lead={lead}
        actions={
          actions || scrollable ? (
            <>
              {actions}
              {scrollable && (
                <Buttons>
                  <ArrowButton type="button" onClick={() => scroll(-1)} disabled={edges.start} aria-label={`Scroll ${label} back`}>
                    <ChevronLeft size={22} aria-hidden />
                  </ArrowButton>
                  <ArrowButton type="button" onClick={() => scroll(1)} disabled={edges.end} aria-label={`Scroll ${label} forward`}>
                    <ChevronRight size={22} aria-hidden />
                  </ArrowButton>
                </Buttons>
              )}
            </>
          ) : undefined
        }
      />
      {fallback ?? (
        <Viewport ref={listRef} $itemWidth={itemWidth} aria-label={label} tabIndex={0}>
          {Children.map(children, (child) => (
            <li>{child}</li>
          ))}
        </Viewport>
      )}
    </Section>
  );
}
