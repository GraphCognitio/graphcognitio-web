import { apiClient } from "./client";
import type { ContextFeedResponse, FeedResponse } from "../features/feed/types/feedTypes";

type FeedQueryParams = {
  cursor: string | null;
  limit: number;
};

export async function getFeedPage({ cursor, limit }: FeedQueryParams) {
  const response = await apiClient.get<FeedResponse>("/feed", {
    params: {
      cursor: cursor ?? undefined,
      limit,
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
