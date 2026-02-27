import { type InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Heart, Network, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { likePost, unlikePost } from "../../../api/postApi";
import type { FeedWorldNode } from "../canvas/worldPlacement";
import type { FeedResponse, PostResponse } from "../types/feedTypes";
import { formatRelativeTime } from "../utils/relativeTime";

type FeedNodeCardProps = {
  node: FeedWorldNode;
  onInspect: (id: string) => void;
};

function dimensionsByReplies(baseWidth: number, baseHeight: number, replyCount: number) {
  const normalizedReplies = Math.max(0, replyCount);
  const growth = Math.min(120, Math.round(Math.sqrt(normalizedReplies) * 14));
  return {
    width: baseWidth + growth,
    height: baseHeight + Math.round(growth * 0.62),
  };
}

function previewContent(content: string) {
  if (content.length <= 170) {
    return content;
  }
  return `${content.slice(0, 170)}...`;
}

export function FeedNodeCard({ node, onInspect }: FeedNodeCardProps) {
  const { post } = node;
  const { width, height } = dimensionsByReplies(node.width, node.height, post.replyCount);
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
      className="aero-glass aero-focus-ring absolute flex flex-col overflow-hidden p-4 transition"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: `${node.x - width / 2}px`,
        top: `${node.y - height / 2}px`,
      }}
      aria-label={`Post by ${post.authorName}`}
      role="button"
      tabIndex={0}
      onClick={() => onInspect(node.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onInspect(node.id);
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
        <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/40 px-2 py-1 text-[11px] font-semibold text-sky-900/90">
          <Sparkles aria-hidden="true" size={12} />
          {post.replyCount} replies
        </span>
      </header>

      <p className="relative z-10 mb-4 line-clamp-4 flex-1 text-sm font-medium text-sky-950/95">
        {previewContent(post.content)}
      </p>

      <footer className="relative z-10 mt-auto flex flex-nowrap items-center gap-2">
        <button
          aria-label={post.likedByMe ? `Unlike post ${post.id}` : `Like post ${post.id}`}
          className={`aero-focus-ring inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-white/55 disabled:cursor-not-allowed disabled:opacity-70 ${
            post.likedByMe
              ? "border-rose-200/85 bg-rose-100/55 text-rose-600"
              : "border-white/70 bg-white/40 text-sky-900"
          }`}
          disabled={likeMutation.isPending}
          onClick={(event) => {
            event.stopPropagation();
            likeMutation.mutate();
          }}
          type="button"
        >
          <Heart
            aria-hidden="true"
            size={12}
            fill={post.likedByMe ? "currentColor" : "none"}
            className="transition-colors"
          />
          {post.likeCount}
        </button>
        <Link
          aria-label={`Open post ${post.id}`}
          className="aero-focus-ring inline-flex shrink-0 items-center gap-1 rounded-full border border-white/70 bg-white/40 px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-white/55"
          to={`/post/${post.id}`}
          onClick={(event) => event.stopPropagation()}
        >
          <Eye aria-hidden="true" size={12} />
          Open
        </Link>
        <Link
          aria-label={`Open graph for root ${post.rootId}`}
          className="aero-focus-ring inline-flex shrink-0 items-center gap-1 rounded-full border border-white/70 bg-white/40 px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-white/55"
          to={`/graph/${post.rootId}`}
          onClick={(event) => event.stopPropagation()}
        >
          <Network aria-hidden="true" size={12} />
          Graph
        </Link>
      </footer>
    </article>
  );
}
