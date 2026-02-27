import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Heart, Network, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { likePost, unlikePost } from "../../../api/postApi";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";
import { resolveFeedNodeDimensions, type FeedWorldNode } from "../canvas/worldPlacement";
import type { FeedResponse, PostResponse } from "../types/feedTypes";
import { formatRelativeTime } from "../utils/relativeTime";

type FeedNodeCardProps = {
  node: FeedWorldNode;
  onBringToFront: (id: string) => void;
  seen: boolean;
  zIndex: number;
};

function previewContent(content: string) {
  if (content.length <= 170) {
    return content;
  }
  return `${content.slice(0, 170)}...`;
}

export function FeedNodeCard({ node, onBringToFront, seen, zIndex }: FeedNodeCardProps) {
  const { post } = node;
  const { width, height } = resolveFeedNodeDimensions(node.width, node.height, post.replyCount);
  const queryClient = useQueryClient();

  const updateFeedCache = (updatedPost: PostResponse) => {
    queryClient.setQueriesData<InfiniteData<FeedResponse>>(
      { queryKey: ["feed", "root-posts"] },
      (current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => (item.id === updatedPost.id ? updatedPost : item)),
          })),
        };
      },
    );
  };

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (post.likedByMe) {
        return unlikePost(post.id);
      }
      return likePost(post.id);
    },
    onSuccess: async (updatedPost) => {
      updateFeedCache(updatedPost);
      queryClient.setQueryData(["post", updatedPost.id], updatedPost);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feed", "root-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["post", updatedPost.id] }),
      ]);
    },
  });

  return (
    <article
      className={`aero-glass aero-focus-ring absolute flex flex-col overflow-hidden p-4 transition ${
        seen ? "border-emerald-200/80 bg-emerald-50/25" : ""
      }`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: `${node.x - width / 2}px`,
        top: `${node.y - height / 2}px`,
        zIndex,
      }}
      data-feed-node-card="true"
      aria-label={`Post by ${post.authorName}`}
      role="button"
      tabIndex={0}
      onClick={() => onBringToFront(node.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onBringToFront(node.id);
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-65"
        style={{
          background:
            "linear-gradient(120deg, rgba(255,255,255,0.22) 10%, transparent 33%, transparent 67%, rgba(255,255,255,0.18) 95%)",
        }}
      />

      <header className="relative z-10 mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-sky-900">{post.authorName}</p>
          <p className="text-xs text-sky-900/70">{formatRelativeTime(post.createdAt)}</p>
        </div>
        <div className="flex items-center gap-1">
          {seen ? (
            <span className="inline-flex items-center rounded-full border border-emerald-200/90 bg-emerald-100/70 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-700">
              Seen
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/40 px-2 py-1 text-[11px] font-semibold text-sky-900/90">
            <AeroIconBadge className="h-4 w-4" tone="cyan">
              <Sparkles aria-hidden="true" size={9} />
            </AeroIconBadge>
            {post.replyCount} replies
          </span>
        </div>
      </header>

      <p className="relative z-10 mb-4 line-clamp-4 flex-1 text-sm font-medium text-sky-950/95">
        {previewContent(post.content)}
      </p>

      <footer className="relative z-10 mt-auto flex flex-nowrap items-center gap-2">
        <button
          aria-label={post.likedByMe ? `Unlike post ${post.id}` : `Like post ${post.id}`}
          className={`aero-pill aero-focus-ring inline-flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-70 ${
            post.likedByMe
              ? "text-rose-600"
              : "text-sky-900"
          }`}
          disabled={likeMutation.isPending}
          onClick={(event) => {
            event.stopPropagation();
            likeMutation.mutate();
          }}
          type="button"
        >
          <AeroIconBadge className="h-4 w-4" tone={post.likedByMe ? "rose" : "cyan"}>
            <Heart aria-hidden="true" size={9} fill={post.likedByMe ? "currentColor" : "none"} className="transition-colors" />
          </AeroIconBadge>
          {post.likeCount}
        </button>
        <Link
          aria-label={`Open post ${post.id}`}
          className="aero-pill aero-focus-ring inline-flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-900"
          to={`/post/${post.id}`}
          onClick={(event) => event.stopPropagation()}
        >
          <AeroIconBadge className="h-4 w-4" tone="cyan">
            <Eye aria-hidden="true" size={9} />
          </AeroIconBadge>
          Open
        </Link>
        <Link
          aria-label={`Open graph for root ${post.rootId}`}
          className="aero-pill aero-focus-ring inline-flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-900"
          to={`/graph/${post.rootId}`}
          onClick={(event) => event.stopPropagation()}
        >
          <AeroIconBadge className="h-4 w-4" tone="violet">
            <Network aria-hidden="true" size={9} />
          </AeroIconBadge>
          Graph
        </Link>
      </footer>
    </article>
  );
}
