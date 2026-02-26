import { apiClient } from "./client";
import type { ConversationGraphResponse } from "../features/graph/types/graphTypes";

type GraphParams = {
  rootId: string;
  depth: number;
  limit: number;
};

export async function getConversationGraph({ rootId, depth, limit }: GraphParams) {
  const response = await apiClient.get<ConversationGraphResponse>(`/graphs/conversation/${rootId}`, {
    params: {
      depth,
      limit,
    },
  });

  return response.data;
}
