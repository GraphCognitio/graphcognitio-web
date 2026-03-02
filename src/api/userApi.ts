import { apiClient } from "./client";
import type { FeedResponse } from "../features/feed/types/feedTypes";
import type { UserProfileResponse } from "../features/profile/types/profileTypes";

export async function getUserProfile(username: string): Promise<UserProfileResponse> {
    const response = await apiClient.get<UserProfileResponse>(`/users/${username}`);
    return response.data;
}

export async function getUserPosts(username: string, cursor?: string, limit: number = 20): Promise<FeedResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append("cursor", cursor);
    params.append("limit", limit.toString());

    const response = await apiClient.get<FeedResponse>(`/users/${username}/posts?${params.toString()}`);
    return response.data;
}

export interface UpdateProfilePayload {
    name?: string;
    bio?: string;
    avatarUrl?: string;
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<UserProfileResponse> {
    const response = await apiClient.patch<UserProfileResponse>("/users/me", payload);
    return response.data;
}
