const SEEN_POSTS_STORAGE_PREFIX = "graphcognitio.feed.seenPosts";

function hasWindow() {
  return typeof window !== "undefined";
}

function storageKey(userId: string) {
  return `${SEEN_POSTS_STORAGE_PREFIX}:${userId}`;
}

export function readSeenPostIds(userId: string | null) {
  if (!userId || !hasWindow()) {
    return new Set<string>();
  }

  const raw = window.localStorage.getItem(storageKey(userId));
  if (!raw) {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    const ids = parsed.filter((value): value is string => typeof value === "string");
    return new Set(ids);
  } catch {
    return new Set<string>();
  }
}

export function writeSeenPostIds(userId: string | null, seenPostIds: Set<string>) {
  if (!userId || !hasWindow()) {
    return;
  }

  window.localStorage.setItem(storageKey(userId), JSON.stringify(Array.from(seenPostIds)));
}
