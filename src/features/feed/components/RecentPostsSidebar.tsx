import { Crosshair, ExternalLink, PanelRightClose, PanelRightOpen, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";
import type { RecentPostItem } from "../storage/recentPostsStorage";
import { formatRelativeTime } from "../utils/relativeTime";

type RecentPostsSidebarProps = {
  collapsed: boolean;
  items: RecentPostItem[];
  onClear: () => void;
  onFocusPost: (postId: string) => void;
  onToggleCollapsed: () => void;
};

export function RecentPostsSidebar({
  collapsed,
  items,
  onClear,
  onFocusPost,
  onToggleCollapsed,
}: RecentPostsSidebarProps) {
  const repliesLabel = (replyCount: number) => (replyCount === 1 ? "reply" : "replies");

  if (collapsed) {
    return (
      <aside className="fixed right-4 top-28 z-40 hidden lg:block">
        <button
          aria-label="Expand recent posts sidebar"
          className="aero-panel aero-focus-ring inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-sky-900"
          onClick={onToggleCollapsed}
          type="button"
        >
          <AeroIconBadge className="h-5 w-5" tone="violet">
            <PanelRightOpen aria-hidden="true" size={11} />
          </AeroIconBadge>
          Recent ({items.length})
        </button>
      </aside>
    );
  }

  return (
    <aside className="fixed bottom-4 right-4 top-28 z-40 hidden w-[320px] min-w-[280px] flex-col gap-3 lg:flex">
      <section className="aero-panel flex h-full min-h-0 flex-col p-3">
        <header className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AeroIconBadge className="h-6 w-6" tone="cyan">
              <Crosshair aria-hidden="true" size={12} />
            </AeroIconBadge>
            <div>
              <h2 className="aero-heading text-sm font-black">Recent Posts</h2>
              <p className="text-[11px] font-semibold text-sky-900/75">{items.length} tracked</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              aria-label="Clear recent posts history"
              className="aero-pill aero-focus-ring inline-flex items-center justify-center px-2.5 py-1.5 text-sky-900"
              onClick={onClear}
              type="button"
            >
              <Trash2 aria-hidden="true" size={12} />
            </button>
            <button
              aria-label="Collapse recent posts sidebar"
              className="aero-pill aero-focus-ring inline-flex items-center justify-center px-2.5 py-1.5 text-sky-900"
              onClick={onToggleCollapsed}
              type="button"
            >
              <PanelRightClose aria-hidden="true" size={12} />
            </button>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="aero-panel flex flex-1 items-center justify-center p-4 text-center text-xs font-semibold text-sky-900/80">
            You have not opened posts yet.
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
            {items.map((item) => (
              <article key={item.id} className="aero-panel p-3">
                <header className="mb-2">
                  <p className="text-xs font-black text-sky-900">{item.authorName}</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-sky-900/72">
                    <span>{formatRelativeTime(item.accessedAt)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.replyCount} {repliesLabel(item.replyCount)}</span>
                  </div>
                </header>
                <p className="mb-2 line-clamp-2 text-xs font-semibold leading-relaxed text-sky-950/90">
                  {item.contentPreview}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    aria-label={`Focus post ${item.id}`}
                    className="aero-pill aero-focus-ring inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-sky-900"
                    onClick={() => onFocusPost(item.id)}
                    type="button"
                  >
                    <AeroIconBadge className="h-4 w-4" tone="cyan">
                      <Crosshair aria-hidden="true" size={9} />
                    </AeroIconBadge>
                    Focus
                  </button>
                  <Link
                    aria-label={`Open post ${item.id}`}
                    className="aero-pill aero-focus-ring inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-sky-900"
                    to={`/post/${item.id}`}
                  >
                    <AeroIconBadge className="h-4 w-4" tone="violet">
                      <ExternalLink aria-hidden="true" size={9} />
                    </AeroIconBadge>
                    Open
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
