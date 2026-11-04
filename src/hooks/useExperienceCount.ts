import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { ExperienceFilters } from "@/types/filters";

type CountResponse = {
  totalCount?: number;
  items: unknown[];
};

function buildParams(filters: ExperienceFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: 1,
    limit: 1,
  };
  if (filters.activityTypes.length > 0) {
    params.activityTypes = filters.activityTypes.join(",");
  }
  if (filters.timeOfDays.length > 0) {
    params.timeOfDays = filters.timeOfDays.join(",");
  }
  if (filters.duration != null) {
    params.duration = filters.duration;
  }
  if (filters.specials.length > 0) {
    params.specials = filters.specials.join(",");
  }
  params.minPrice = filters.priceRange[0];
  params.maxPrice = filters.priceRange[1];
  return params;
}

function serializeFilters(filters: ExperienceFilters): string {
  return JSON.stringify({
    activityTypes: [...filters.activityTypes].sort(),
    timeOfDays: [...filters.timeOfDays].sort(),
    duration: filters.duration,
    specials: [...filters.specials].sort(),
    priceRange: filters.priceRange,
  });
}

/**
 * Fetches the total count of experiences matching the given filters.
 * Uses GET /experiences with limit=1 to read totalCount from the first page.
 */
export function useExperienceCount(filters: ExperienceFilters, enabled: boolean) {
  const key = serializeFilters(filters);
  return useQuery({
    queryKey: ["experienceCount", key],
    queryFn: async () => {
      const { data } = await apiClient.get<CountResponse>("/experiences", {
        params: buildParams(filters),
      });
      return data;
    },
    enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
