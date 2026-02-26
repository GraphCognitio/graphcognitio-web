import { ArrowRight, Network } from "lucide-react";
import { Link } from "react-router-dom";
import type { FeedWorldNode } from "../canvas/worldPlacement";
import { formatRelativeTime } from "../utils/relativeTime";

type FeedInspectorPanelProps = {
  node: FeedWorldNode | null;
  onClose: () => void;
};

function previewContent(content: string) {
  if (content.length <= 320) {
    return content;
  }
  return `${content.slice(0, 320)}...`;
}

export function FeedInspectorPanel({ node, onClose }: FeedInspectorPanelProps) {
  if (!node) {
    return null;
  }

  return (
    <aside className="aero-glass absolute right-4 top-4 z-30 w-[min(360px,calc(100%-2rem))] p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="aero-heading text-lg font-black">Post preview</h2>
          <p className="text-xs text-sky-900/75">{formatRelativeTime(node.post.createdAt)}</p>
        </div>
        <button
          aria-label="Close preview panel"
          className="aero-focus-ring rounded-full border border-white/70 bg-white/45 px-3 py-1 text-xs font-bold text-sky-900"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </header>

      <div className="mb-3 text-sm text-sky-900/92">
        <p className="mb-1 font-bold">{node.post.authorName}</p>
        <p className="leading-relaxed">{previewContent(node.post.content)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          className="aero-gel aero-focus-ring inline-flex items-center gap-1 px-4 py-2 text-xs"
          to={`/post/${node.post.id}`}
        >
          Open post
          <ArrowRight aria-hidden="true" size={12} />
        </Link>
        <Link
          className="aero-focus-ring inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-xs font-semibold text-sky-900"
          to={`/graph/${node.post.rootId}`}
        >
          <Network aria-hidden="true" size={12} />
          View graph
        </Link>
      </div>
    </aside>
  );
}
