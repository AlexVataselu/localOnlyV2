import { useInfiniteQuery } from "@tanstack/react-query";
import { request } from "@/lib/api/client";
import type { ExperiencesPage } from "@/types/experience";
import { type ExperienceFilters, filtersToSearchParams } from "@/types/filters";

const PAGE_SIZE = 12;

/** Server-side filtered, paginated experiences. The query key is the canonical query string. */
export function useExperiencesQuery(filters: ExperienceFilters, pageSize = PAGE_SIZE) {
  const base = filtersToSearchParams(filters);
  base.set("limit", String(pageSize));
  const key = base.toString();

  return useInfiniteQuery<ExperiencesPage>({
    queryKey: ["experiences", key],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams(key);
      params.set("page", String(pageParam));
      return request<ExperiencesPage>(`/experiences?${params.toString()}`);
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    placeholderData: (previous) => previous,
  });
}
