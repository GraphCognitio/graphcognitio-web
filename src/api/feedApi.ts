import { apiClient } from "./client";
import type { ContextFeedResponse, FeedResponse } from "../features/feed/types/feedTypes";

type FeedQueryParams = {
  cursor: string | null;
  limit: number;
  sort?: "recent" | "relevant";
};

export async function getFeedPage({ cursor, limit, sort }: FeedQueryParams) {
  const response = await apiClient.get<FeedResponse>("/feed", {
    params: {
      cursor: cursor ?? undefined,
      limit,
      sort,
    },
  });

  return response.data;
}

export async function getFeedContext(limit: number) {
  const response = await apiClient.get<ContextFeedResponse>("/feed/context", {
    params: { limit },
  });
  return response.data;
}
