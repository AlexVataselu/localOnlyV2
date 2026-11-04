"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import ExperienceCard, { CARD_IMAGE_RATIO } from "./ExperienceCard";
import { Experience } from "@/types/experience";

const GRID_GAP_PX = 32; // matches 2rem gap from previous grid
const INFO_HEIGHT_ESTIMATE = 160; // heuristic for text block height
const RESIZE_THROTTLE_MS = 100;
const MIN_WIDTH_DELTA = 2; // ignore sub-pixel resize churn

const GridContainer = styled.div`
  position: relative;
  width: 100%;
`;

const VirtualRow = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const RowGrid = styled.div<{ $columns: number }>`
  display: grid;
  width: 100%;
  gap: ${GRID_GAP_PX}px;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  padding-bottom: ${GRID_GAP_PX}px;
`;

const SimpleGrid = styled.div<{ $columns: number }>`
  display: grid;
  width: 100%;
  gap: ${GRID_GAP_PX}px;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
`;

type ExperienceGridProps = {
  experiences: Experience[];
};

export default function ExperienceGrid({ experiences }: ExperienceGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const columns = useMemo(() => {
    if (containerWidth >= 1080) return 4;
    if (containerWidth >= 800) return 3;
    if (containerWidth >= 560) return 2;
    return 1;
  }, [containerWidth]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let lastWidth = 0;
    let throttleTimer: ReturnType<typeof setTimeout> | null = null;

    const resizeObserver = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      if (Math.abs(w - lastWidth) < MIN_WIDTH_DELTA) return;

      if (throttleTimer) clearTimeout(throttleTimer);
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        lastWidth = w;
        setContainerWidth(w);
      }, RESIZE_THROTTLE_MS);
    });
    resizeObserver.observe(node);

    return () => {
      if (throttleTimer) clearTimeout(throttleTimer);
      resizeObserver.disconnect();
    };
  }, []);

  const rows = useMemo(() => {
    if (!experiences.length) {
      return [];
    }
    const nextRows: Experience[][] = [];
    for (let i = 0; i < experiences.length; i += columns) {
      nextRows.push(experiences.slice(i, i + columns));
    }
    return nextRows;
  }, [experiences, columns]);

  const safeColumns = useMemo(() => Math.max(columns, 1), [columns]);

  const estimatedRowHeight = useMemo(() => {
    if (containerWidth === 0) {
      return 320;
    }
    const totalGapWidth = GRID_GAP_PX * Math.max(safeColumns - 1, 0);
    const cardWidth = (containerWidth - totalGapWidth) / safeColumns;
    const imageHeight = cardWidth / CARD_IMAGE_RATIO;
    return imageHeight + INFO_HEIGHT_ESTIMATE + GRID_GAP_PX;
  }, [safeColumns, containerWidth]);

  // Virtualize when we have enough items to benefit (reduces DOM nodes and paint)
  const shouldUseVirtualization =
    experiences.length > 12 && containerWidth > 0;

  // Don't use scrollMargin - the container is already correctly positioned
  // in the document flow, and using scrollMargin can cause layout shifts
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => estimatedRowHeight,
    overscan: 4,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  if (!shouldUseVirtualization) {
    return (
      <GridContainer ref={containerRef}>
        <SimpleGrid $columns={safeColumns}>
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} headingLevel="h2" />
          ))}
        </SimpleGrid>
      </GridContainer>
    );
  }

  return (
    <GridContainer ref={containerRef}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
          contain: "layout style paint",
        }}
      >
        {virtualRows.map((virtualRow) => {
          const rowExperiences = rows[virtualRow.index] ?? [];

          return (
            <VirtualRow
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                willChange: "transform",
              }}
            >
              <RowGrid $columns={safeColumns}>
                {rowExperiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                  />
                ))}
              </RowGrid>
            </VirtualRow>
          );
        })}
      </div>
    </GridContainer>
  );
}

