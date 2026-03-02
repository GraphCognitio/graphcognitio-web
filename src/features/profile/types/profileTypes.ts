export interface UserProfileResponse {
    username: string;
    displayName: string;
    bio: string | null;
    createdAt: string;
    avatarUrl: string | null;
    postsCount: number;
}
