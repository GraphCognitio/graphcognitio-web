import type { PostResponse } from "../types/feedTypes";

const RECENT_POSTS_STORAGE_PREFIX = "graphcognitio.feed.recentPosts";
const RECENT_POSTS_LIMIT = 20;
const PREVIEW_MAX_LENGTH = 140;

export type RecentPostItem = {
  id: string;
  rootId: string;
  authorName: string;
  contentPreview: string;
  replyCount: number;
  accessedAt: string;
};

function hasWindow() {
  return typeof window !== "undefined";
}

function storageKey(userId: string) {
  return `${RECENT_POSTS_STORAGE_PREFIX}:${userId}`;
}

function toContentPreview(content: string) {
  if (content.length <= PREVIEW_MAX_LENGTH) {
    return content;
  }
  return `${content.slice(0, PREVIEW_MAX_LENGTH)}...`;
}

function isRecentPostItem(value: unknown): value is RecentPostItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.rootId === "string" &&
    typeof candidate.authorName === "string" &&
    typeof candidate.contentPreview === "string" &&
    (candidate.replyCount === undefined || typeof candidate.replyCount === "number") &&
    typeof candidate.accessedAt === "string"
  );
}

function normalizeRecentPostItem(value: unknown): RecentPostItem | null {
  if (!isRecentPostItem(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  return {
    id: candidate.id as string,
    rootId: candidate.rootId as string,
    authorName: candidate.authorName as string,
    contentPreview: candidate.contentPreview as string,
    replyCount: typeof candidate.replyCount === "number" ? candidate.replyCount : 0,
    accessedAt: candidate.accessedAt as string,
  };
}

export function readRecentPosts(userId: string | null) {
  if (!userId || !hasWindow()) {
    return [] as RecentPostItem[];
  }

  const raw = window.localStorage.getItem(storageKey(userId));
  if (!raw) {
    return [] as RecentPostItem[];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as RecentPostItem[];
    }

    return parsed
      .map((item) => normalizeRecentPostItem(item))
      .filter((item): item is RecentPostItem => item !== null);
  } catch {
    return [] as RecentPostItem[];
  }
}

export function writeRecentPosts(userId: string | null, items: RecentPostItem[]) {
  if (!userId || !hasWindow()) {
    return;
  }

  const normalized = items.slice(0, RECENT_POSTS_LIMIT);
  window.localStorage.setItem(storageKey(userId), JSON.stringify(normalized));
}

export function clearRecentPosts(userId: string | null) {
  if (!userId || !hasWindow()) {
    return;
  }

  window.localStorage.removeItem(storageKey(userId));
}

export function touchRecentPost(userId: string | null, post: PostResponse) {
  if (!userId || !hasWindow()) {
    return;
  }

  const current = readRecentPosts(userId);
  const withoutCurrent = current.filter((item) => item.id !== post.id);

  const next: RecentPostItem[] = [
    {
      id: post.id,
      rootId: post.rootId,
      authorName: post.authorName,
      contentPreview: toContentPreview(post.content),
      replyCount: post.replyCount,
      accessedAt: new Date().toISOString(),
    },
    ...withoutCurrent,
  ];

  writeRecentPosts(userId, next);
}
