"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import AppFooter from "@/components/AppFooter";
import ExperienceGrid from "@/components/ExperienceGrid";
import FilterBar from "@/components/FilterBar";
import FilterModal from "@/components/FilterModal";
import SearchBar, { type SearchValues } from "@/components/SearchBar";
import SiteHeader from "@/components/ui/SiteHeader";
import { Button, EmptyState, ErrorState, Skeleton } from "@/components/ui/Status";
import { useExperiencesQuery } from "@/hooks/useExperiencesQuery";
import {
  countActiveFilters,
  DEFAULT_FILTERS,
  type ExperienceFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
} from "@/types/filters";
import { pluralize } from "@/utils/formatters";

const Main = styled.main`
  padding: 1.5rem clamp(16px, 5vw, 80px) 0;
`;

const Heading = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin-bottom: 1.5rem;

  h1 {
    margin: 0;
    font-family: var(--font-display), sans-serif;
    font-weight: 900;
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Skeletons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr));
  gap: 2rem;
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

function describe(filters: ExperienceFilters) {
  const parts: string[] = [];
  if (filters.q) parts.push(`“${filters.q}”`);
  if (filters.location) parts.push(`in ${filters.location}`);
  return parts.join(" ");
}

export default function ExperiencesView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const [modalOpen, setModalOpen] = useState(false);

  const setFilters = useCallback(
    (next: ExperienceFilters) => {
      const query = filtersToSearchParams(next).toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const { data, isPending, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isFetchNextPageError } =
    useExperiencesQuery(filters);

  const experiences = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const total = data?.pages[0]?.totalCount ?? 0;

  // Infinite scroll: load the next page when the sentinel nears the viewport.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const handleSearch = ({ location, q }: SearchValues) => setFilters({ ...filters, location, q });
  const searchKey = `${filters.location}|${filters.q}`;
  const summary = describe(filters);
  const hasRefinements = countActiveFilters(filters) > 0 || Boolean(filters.q || filters.location);

  return (
    <>
      <SiteHeader
        middle={
          <SearchBar key={searchKey} defaultValues={{ location: filters.location, q: filters.q }} onSubmit={handleSearch} />
        }
        below={<FilterBar filters={filters} onChange={setFilters} onOpenModal={() => setModalOpen(true)} />}
      />
      <Main id="main" aria-busy={isFetching && !isFetchingNextPage}>
        <Heading>
          <h1>{summary ? `Experiences ${summary}` : "All experiences"}</h1>
          {!isPending && !(isError && !isFetchNextPageError) && (
            <p aria-live="polite">{pluralize(total, "experience", "experiences")}</p>
          )}
        </Heading>

        {isPending ? (
          <Skeletons aria-label="Loading experiences">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} $height="380px" />
            ))}
          </Skeletons>
        ) : isError && !isFetchNextPageError ? (
          <ErrorState
            title="We couldn't load experiences"
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => refetch()}
          />
        ) : experiences.length === 0 ? (
          <EmptyState title="No experiences match">
            <p>Try a different place or fewer filters.</p>
            {hasRefinements && (
              <Button type="button" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear search and filters
              </Button>
            )}
          </EmptyState>
        ) : (
          <>
            <ExperienceGrid experiences={experiences} />
            <div ref={sentinelRef} />
            <Footer>
              {isFetchNextPageError ? (
                <ErrorState title="Couldn't load more" onRetry={() => fetchNextPage()} />
              ) : isFetchingNextPage ? (
                <span role="status">Loading more…</span>
              ) : hasNextPage ? (
                <Button type="button" onClick={() => fetchNextPage()}>
                  Load more
                </Button>
              ) : (
                <span>You&apos;ve seen all {pluralize(total, "experience", "experiences")}.</span>
              )}
            </Footer>
          </>
        )}
      </Main>
      <AppFooter />
      {modalOpen && (
        <FilterModal open filters={filters} onApply={setFilters} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
