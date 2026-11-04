"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import styled from "styled-components";
import AppHeader from "@/components/AppHeader";
import FilterBar from "@/components/FilterBar";
import FilterModal from "@/components/FilterModal";
import SearchBar from "@/components/SearchBar";
import { useExperiencesQuery } from "@/hooks/useExperiencesQuery";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import ExperienceGrid from "@/components/ExperienceGrid";
import AppFooter from "@/components/AppFooter";
import { ExperienceFilters, DEFAULT_FILTERS } from "@/types/filters";
import {
  SearchParams,
  DEFAULT_SEARCH_PARAMS,
} from "@/types/search";

const PageWrapper = styled.div`
  min-height: 100vh;
`;

const Container = styled.div`
  width: 100%;
  padding: 0 clamp(24px, 5vw, 80px) 2rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const Content = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Prevents flex children from overflowing */
`;

const Loading = styled.div`
  text-align: center;
  padding: 4rem 0;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Error = styled.div`
  text-align: center;
  padding: 4rem 0;
  color: ${({ theme }) => theme.colors.accentText};
  font-size: 1.2rem;
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 4rem 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;

  p {
    margin: 0;
  }
`;

const ClearButton = styled.button`
  min-height: 44px;
  padding: 0 1.25rem;
  border: none;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.onAccent};
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }
`;

const GridWrapper = styled.div`
  flex: 1;
  padding-top: 2rem;
  min-height: 0; /* Prevents flex children from overflowing */
  position: relative;
`;

const LoadMoreSentinel = styled.div`
  height: 1px;
`;

const LoadingMore = styled.div`
  text-align: center;
  padding: 2rem 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export default function ExperiencesPage() {
  const urlSearch = useSearchParams();
  const [filters, setFilters] = useState<ExperienceFilters>(DEFAULT_FILTERS);
  const [searchParams, setSearchParams] = useState<SearchParams>(DEFAULT_SEARCH_PARAMS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Sync URL -> searchParams when landing from e.g. home (HeaderSearchBar navigates with ?location= & ?experience=).
  // Adjusted during render when the URL changes (React's pattern for deriving state from changing input).
  const urlKey = `${urlSearch.get("location") ?? ""}|${urlSearch.get("experience") ?? ""}`;
  const [syncedUrlKey, setSyncedUrlKey] = useState("|");
  if (urlKey !== syncedUrlKey) {
    setSyncedUrlKey(urlKey);
    const [loc, exp] = urlKey.split("|");
    if (loc || exp) setSearchParams((prev) => ({ ...prev, location: loc, experience: exp }));
  }

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExperiencesQuery(filters);

  const experiences = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  // Debounce search inputs so filtering runs only when the user stops typing (performance).
  const debouncedLocation = useDebouncedValue(searchParams.location, 300);
  const debouncedExperience = useDebouncedValue(searchParams.experience, 300);

  // Client-side filtering by SearchBar (location, experience text). Date is for future API.
  const filteredExperiences = useMemo(() => {
    let list = experiences;
    const loc = debouncedLocation.trim().toLowerCase();
    if (loc) {
      list = list.filter((e) =>
        e.location.toLowerCase().includes(loc),
      );
    }
    const exp = debouncedExperience.trim().toLowerCase();
    if (exp) {
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(exp) ||
          (e.description ?? "").toLowerCase().includes(exp),
      );
    }
    return list;
  }, [experiences, debouncedLocation, debouncedExperience]);

  const averagePrice = useMemo(() => {
    return data?.pages[0]?.averagePrice ?? 0;
  }, [data]);

  // Slider bounds come from the API (all matching listings), not from the cards loaded so far:
  // bounds taken from page 1 clamped the filter and silently hid pricier listings on later pages.
  const { minPrice, maxPrice } = useMemo(() => {
    const apiMax = data?.pages[0]?.maxPrice;
    return { minPrice: 0, maxPrice: apiMax && apiMax > 0 ? Math.ceil(apiMax) : 1000 };
  }, [data]);

  const totalCount = useMemo(() => {
    return data?.pages[0]?.totalCount ?? experiences.length;
  }, [data, experiences.length]);

  const handleFiltersChange = useCallback((newFilters: ExperienceFilters) => {
    setFilters(newFilters);
  }, []);

  const handleOpenFilterModal = useCallback(() => {
    setIsFilterModalOpen(true);
  }, []);

  const handleCloseFilterModal = useCallback(() => {
    setIsFilterModalOpen(false);
  }, []);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const sentinel = loadMoreRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.find((item) => item.isIntersecting);

        if (entry && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <PageWrapper>
        <AppHeader
          title="Experiences"
          centerSlot={
            <SearchBar
              value={searchParams}
              onChange={setSearchParams}
              onSearch={setSearchParams}
            />
          }
          bottomSlot={
            <FilterBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onOpenModal={handleOpenFilterModal}
            />
          }
        />
        <Container>
          <Loading>Loading experiences...</Loading>
        </Container>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper>
        <AppHeader
          title="Experiences"
          centerSlot={
            <SearchBar
              value={searchParams}
              onChange={setSearchParams}
              onSearch={setSearchParams}
            />
          }
          bottomSlot={
            <FilterBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onOpenModal={handleOpenFilterModal}
            />
          }
        />
        <Container>
          <Error>
            {error instanceof Error
              ? error.message
              : "Error loading experiences. Please try again later."}
          </Error>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <AppHeader
        title="Experiences"
        centerSlot={
          <SearchBar
            value={searchParams}
            onChange={setSearchParams}
            onSearch={setSearchParams}
          />
        }
        bottomSlot={
          <FilterBar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onOpenModal={handleOpenFilterModal}
          />
        }
      />
      <Container>
        <Content>
          {filteredExperiences.length > 0 ? (
            <>
              <GridWrapper>
                <ExperienceGrid experiences={filteredExperiences} />
              </GridWrapper>
              <LoadMoreSentinel ref={loadMoreRef} />
              {isFetchingNextPage && <LoadingMore>Loading more experiences...</LoadingMore>}
              {!hasNextPage && !isFetchingNextPage && (
                <LoadingMore>All experiences loaded.</LoadingMore>
              )}
            </>
          ) : (
            <Empty>
              <p>No experiences match your search and filters.</p>
              <ClearButton
                type="button"
                onClick={() => {
                  setFilters(DEFAULT_FILTERS);
                  setSearchParams(DEFAULT_SEARCH_PARAMS);
                }}
              >
                Clear search and filters
              </ClearButton>
            </Empty>
          )}
        </Content>
      </Container>
      <AppFooter />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={handleCloseFilterModal}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        resultCount={totalCount}
        averagePrice={averagePrice}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />
    </PageWrapper>
  );
}

