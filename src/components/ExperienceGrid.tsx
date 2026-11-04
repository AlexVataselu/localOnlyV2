"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import ExperienceCard, { CARD_IMAGE_RATIO } from "./ExperienceCard";
import type { Experience } from "@/types/experience";

const GAP = 32;
const BODY_ESTIMATE = 170; // text block under the image
const VIRTUALIZE_AFTER_ROWS = 8;

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const RowGrid = styled.ul<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: ${GAP}px;
  margin: 0;
  padding: 0 0 ${GAP}px;
  list-style: none;
`;

function columnsFor(width: number) {
  if (width >= 1080) return 3;
  if (width >= 680) return 2;
  return 1;
}

/**
 * Responsive grid. Long lists are virtualized by row against the window
 * scroll; `scrollMargin` is the grid's distance from the top of the page so
 * the virtualizer knows which rows are actually on screen.
 */
export default function ExperienceGrid({ experiences }: { experiences: Experience[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ width: 0, offsetTop: 0 });

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const measure = () =>
      setLayout({ width: node.clientWidth, offsetTop: node.getBoundingClientRect().top + window.scrollY });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const columns = columnsFor(layout.width);
  const rows = useMemo(() => {
    const out: Experience[][] = [];
    for (let i = 0; i < experiences.length; i += columns) out.push(experiences.slice(i, i + columns));
    return out;
  }, [experiences, columns]);

  const cardWidth = layout.width ? (layout.width - GAP * (columns - 1)) / columns : 360;
  const rowEstimate = cardWidth / CARD_IMAGE_RATIO + BODY_ESTIMATE + GAP;
  const virtualize = layout.width > 0 && rows.length > VIRTUALIZE_AFTER_ROWS;

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => rowEstimate,
    overscan: 3,
    scrollMargin: layout.offsetTop,
    enabled: virtualize,
  });

  if (!virtualize) {
    return (
      <Container ref={containerRef}>
        <RowGrid $columns={columns}>
          {experiences.map((experience, i) => (
            <li key={experience.id}>
              <ExperienceCard experience={experience} priority={i < columns} headingLevel="h2" />
            </li>
          ))}
        </RowGrid>
      </Container>
    );
  }

  return (
    <Container ref={containerRef} style={{ height: virtualizer.getTotalSize() }}>
      {virtualizer.getVirtualItems().map((row) => (
        <div
          key={row.key}
          data-index={row.index}
          ref={virtualizer.measureElement}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${row.start - virtualizer.options.scrollMargin}px)`,
          }}
        >
          <RowGrid $columns={columns}>
            {rows[row.index].map((experience) => (
              <li key={experience.id}>
                <ExperienceCard experience={experience} headingLevel="h2" />
              </li>
            ))}
          </RowGrid>
        </div>
      ))}
    </Container>
  );
}
