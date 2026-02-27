import { Eye, Network, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { FeedWorldNode } from "../canvas/worldPlacement";
import { formatRelativeTime } from "../utils/relativeTime";

type FeedNodeCardProps = {
  node: FeedWorldNode;
  onInspect: (id: string) => void;
};

function previewContent(content: string) {
  if (content.length <= 170) {
    return content;
  }
  return `${content.slice(0, 170)}...`;
}

export function FeedNodeCard({ node, onInspect }: FeedNodeCardProps) {
  const { post } = node;

  return (
    <article
      className="aero-glass aero-focus-ring absolute overflow-hidden p-4 transition"
      style={{
        width: `${node.width}px`,
        height: `${node.height}px`,
        left: `${node.x - node.width / 2}px`,
        top: `${node.y - node.height / 2}px`,
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

      <p className="relative z-10 mb-4 line-clamp-4 text-sm font-medium text-sky-950/95">{previewContent(post.content)}</p>

      <footer className="relative z-10 mt-auto flex items-center gap-2">
        <Link
          aria-label={`Open post ${post.id}`}
          className="aero-focus-ring inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/40 px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-white/55"
          to={`/post/${post.id}`}
          onClick={(event) => event.stopPropagation()}
        >
          <Eye aria-hidden="true" size={12} />
          Open
        </Link>
        <Link
          aria-label={`Open graph for root ${post.rootId}`}
          className="aero-focus-ring inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/40 px-3 py-1.5 text-xs font-semibold text-sky-900 hover:bg-white/55"
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
