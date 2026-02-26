import { apiClient } from "./client";
import type { PostResponse } from "../features/feed/types/feedTypes";

export async function getPostById(postId: string) {
  const response = await apiClient.get<PostResponse>(`/posts/${postId}`);
  return response.data;
}

type ReplyPayload = {
  postId: string;
  content: string;
};

export async function replyToPost({ postId, content }: ReplyPayload) {
  const response = await apiClient.post<PostResponse>(`/posts/${postId}/reply`, { content });
  return response.data;
}
