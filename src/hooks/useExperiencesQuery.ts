import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Experience } from "@/types/experience";
import { ExperienceFilters } from "@/types/filters";

const PAGE_SIZE = 9;

export type ExperiencesPage = {
  items: Experience[];
  nextPage: number | null;
  hasMore: boolean;
  totalCount?: number;
  averagePrice?: number;
  maxPrice?: number;
};

// Serialize filters to create a stable query key (copy arrays before sort to avoid mutating)
function serializeFilters(filters?: ExperienceFilters): string {
  if (!filters) return "default";
  return JSON.stringify({
    activityTypes: [...filters.activityTypes].sort().join(","),
    timeOfDays: [...filters.timeOfDays].sort().join(","),
    duration: filters.duration,
    specials: [...filters.specials].sort().join(","),
    priceRange: filters.priceRange,
  });
}

export const useExperiencesQuery = (filters?: ExperienceFilters) => {
  const stableFiltersKey = serializeFilters(filters);
  
  return useInfiniteQuery<ExperiencesPage>({
    queryKey: ["experiences", stableFiltersKey],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params: Record<string, any> = {
        page: pageParam,
        limit: PAGE_SIZE,
      };

      if (filters) {
        if (filters.activityTypes.length > 0) {
          params.activityTypes = filters.activityTypes.join(",");
        }
        if (filters.timeOfDays.length > 0) {
          params.timeOfDays = filters.timeOfDays.join(",");
        }
        if (filters.duration && filters.duration !== null) {
          params.duration = filters.duration;
        }
        if (filters.specials.length > 0) {
          params.specials = filters.specials.join(",");
        }
        params.minPrice = filters.priceRange[0];
        params.maxPrice = filters.priceRange[1];
      }

      const { data } = await apiClient.get<ExperiencesPage>("/experiences", {
        params,
      });

      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
  });
};

