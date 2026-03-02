import { apiClient } from "./client";
import type { FeedResponse } from "../features/feed/types/feedTypes";

type SearchQueryParams = {
  q: string;
  cursor: string | null;
  limit: number;
};

export async function getSearchPage({ q, cursor, limit }: SearchQueryParams) {
  const response = await apiClient.get<FeedResponse>("/search", {
    params: {
      q,
      cursor: cursor ?? undefined,
      limit,
    },
  });

  return response.data;
}
