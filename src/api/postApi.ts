import { apiClient } from "./client";
import type { PostResponse } from "../features/feed/types/feedTypes";

type CreatePostPayload = {
  content: string;
};

export async function getPostById(postId: string) {
  const response = await apiClient.get<PostResponse>(`/posts/${postId}`);
  return response.data;
}

export async function createPost({ content }: CreatePostPayload) {
  const response = await apiClient.post<PostResponse>("/posts", { content });
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

export async function likePost(postId: string) {
  const response = await apiClient.post<PostResponse>(`/posts/${postId}/likes`);
  return response.data;
}

export async function unlikePost(postId: string) {
  const response = await apiClient.delete<PostResponse>(`/posts/${postId}/likes`);
  return response.data;
}

export type UpdatePostPayload = {
  postId: string;
  content: string;
};

export async function updatePost({ postId, content }: UpdatePostPayload) {
  const response = await apiClient.patch<PostResponse>(`/posts/${postId}`, { content });
  return response.data;
}

export async function deletePost(postId: string) {
  await apiClient.delete(`/posts/${postId}`);
}

export async function getRelatedPosts(postId: string, limit: number = 5) {
  const response = await apiClient.get<PostResponse[]>(`/posts/${postId}/related`, {
    params: { limit },
  });
  return response.data;
}
