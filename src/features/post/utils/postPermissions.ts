import type { AuthRole } from "../../auth/types/authTypes";
import type { PostResponse } from "../../feed/types/feedTypes";

export function canEditPost(post: PostResponse, userId: string | null) {
  return Boolean(userId && post.authorId === userId);
}

export function canDeletePost(post: PostResponse, userId: string | null, role: AuthRole | null) {
  if (!userId) {
    return false;
  }

  if (post.authorId === userId) {
    return true;
  }

  return role === "MOD" || role === "ADMIN";
}
