import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "../../../components/layout/AppShell";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";
import { AeroToast } from "../../../components/ui/AeroToast";
import { useAuth } from "../../auth/hooks/useAuth";
import { FeedCanvas } from "../components/FeedCanvas";
import { RecentPostsSidebar } from "../components/RecentPostsSidebar";
import {
  clearRecentPosts,
  readRecentPosts,
  type RecentPostItem,
} from "../storage/recentPostsStorage";
import type { PostResponse } from "../types/feedTypes";

export function FeedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreatedToast, setShowCreatedToast] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ postId: string; post?: PostResponse } | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPostItem[]>([]);
  const [recentCollapsed, setRecentCollapsed] = useState(false);
  const [feedSort, setFeedSort] = useState<"recent" | "relevant">("recent");

  const handleFocusHandled = useCallback((postId: string) => {
    setFocusRequest((current) => (current?.postId === postId ? null : current));
  }, []);

  useEffect(() => {
    const reloadRecentPosts = () => {
      setRecentPosts(readRecentPosts(user?.id ?? null));
    };

    reloadRecentPosts();
    window.addEventListener("storage", reloadRecentPosts);
    window.addEventListener("focus", reloadRecentPosts);

    return () => {
      window.removeEventListener("storage", reloadRecentPosts);
      window.removeEventListener("focus", reloadRecentPosts);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!showCreatedToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowCreatedToast(false);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [showCreatedToast]);

  useEffect(() => {
    const state = location.state as
      | {
        focusPostId?: string;
        focusPost?: PostResponse;
        showCreatedToast?: boolean;
      }
      | null;

    if (!state?.focusPostId && !state?.showCreatedToast) {
      return;
    }

    if (state.focusPostId) {
      setFocusRequest({ postId: state.focusPostId, post: state.focusPost });
    }
    if (state.showCreatedToast) {
      setShowCreatedToast(true);
    }

    navigate(location.pathname + location.search, { replace: true, state: null });
  }, [location.pathname, location.search, location.state, navigate]);

  return (
    <AppShell
      contentClassName="max-w-[92rem] p-4 md:p-6"
      onRootPostCreated={(createdPost) => {
        setFocusRequest({ postId: createdPost.id, post: createdPost });
        setShowCreatedToast(true);
      }}
    >
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="aero-heading text-3xl font-black">GraphCognitio Feed</h1>
          <p className="aero-subtitle text-sm mb-3">Infinite pan canvas of root posts</p>
          <div className="flex bg-white/40 p-1 rounded-full w-fit backdrop-blur-md border border-white/50 shadow-inner">
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${feedSort === "recent"
                  ? "bg-white text-sky-900 shadow-sm"
                  : "text-sky-800/70 hover:text-sky-900 hover:bg-white/50"
                }`}
              onClick={() => setFeedSort("recent")}
            >
              Recentes
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${feedSort === "relevant"
                  ? "bg-white text-sky-900 shadow-sm"
                  : "text-sky-800/70 hover:text-sky-900 hover:bg-white/50"
                }`}
              onClick={() => setFeedSort("relevant")}
            >
              Relevantes
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="aero-pill inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-sky-900">
            <AeroIconBadge className="h-5 w-5" tone="lime">
              <span className="text-[10px] font-black leading-none">U</span>
            </AeroIconBadge>
            {user?.name ?? "Guest"}
          </span>
        </div>
      </header>

      {showCreatedToast ? (
        <div className="mb-3 max-w-md">
          <AeroToast message="Post created" variant="success" />
        </div>
      ) : null}

      <div className="lg:pr-[352px]">
        <FeedCanvas
          key={feedSort}
          feedSort={feedSort}
          viewerUserId={user?.id ?? null}
          focusPostId={focusRequest?.postId ?? null}
          focusPostPayload={focusRequest?.post ?? null}
          onFocusHandled={handleFocusHandled}
        />
      </div>
      <RecentPostsSidebar
        collapsed={recentCollapsed}
        items={recentPosts}
        onClear={() => {
          clearRecentPosts(user?.id ?? null);
          setRecentPosts([]);
        }}
        onFocusPost={(postId) => setFocusRequest({ postId })}
        onToggleCollapsed={() => setRecentCollapsed((current) => !current)}
      />
    </AppShell>
  );
}
