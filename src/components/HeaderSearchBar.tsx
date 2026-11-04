"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import { SearchParams, DEFAULT_SEARCH_PARAMS } from "@/types/search";

/**
 * SearchBar for the header on non-experiences pages.
 * Owns its state and navigates to /experiences with location & experience on search.
 */
export default function HeaderSearchBar() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<SearchParams>(DEFAULT_SEARCH_PARAMS);

  const onSearch = useCallback(
    (v: SearchParams) => {
      const q = new URLSearchParams();
      if (v.location) q.set("location", v.location);
      if (v.experience) q.set("experience", v.experience);
      router.push(`/experiences${q.toString() ? `?${q.toString()}` : ""}`);
    },
    [router],
  );

  return (
    <SearchBar
      value={searchParams}
      onChange={setSearchParams}
      onSearch={onSearch}
    />
  );
}
