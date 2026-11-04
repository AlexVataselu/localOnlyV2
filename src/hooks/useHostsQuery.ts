import { useQuery } from "@tanstack/react-query";
import { request } from "@/lib/api/client";
import type { HostProfile } from "@/types/experience";

export function useHostsQuery(limit = 12) {
  return useQuery({
    queryKey: ["hosts", limit],
    queryFn: () => request<{ items: HostProfile[] }>(`/hosts?limit=${limit}`).then((r) => r.items),
  });
}
