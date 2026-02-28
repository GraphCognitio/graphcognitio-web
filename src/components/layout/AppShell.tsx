import { useMemo, useState, type PropsWithChildren } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ArrowLeft, LoaderCircle, LogOut, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPost } from "../../api/postApi";
import { useAuth } from "../../features/auth/hooks/useAuth";
import type { PostResponse } from "../../features/feed/types/feedTypes";
import { AeroDockSidebar, type AeroDockActionItem } from "../nav/AeroDockSidebar";
import { AeroIconBadge } from "../ui/AeroIconBadge";
import { AeroModal } from "../ui/AeroModal";
import { AeroToast } from "../ui/AeroToast";
import { GelButton } from "../ui/GelButton";
import { AeroScene } from "./AeroScene";

type ProblemDetail = {
  detail?: string;
};

type FeedFocusNavigationState = {
  focusPostId?: string;
  focusPost?: PostResponse;
  showCreatedToast?: boolean;
};

type AppShellProps = PropsWithChildren<{
  contentClassName?: string;
  contextualActions?: AeroDockActionItem[];
  onRootPostCreated?: (post: PostResponse) => void;
  sceneClassName?: string;
}>;

export function AppShell({ children, contentClassName, contextualActions, onRootPostCreated, sceneClassName }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [dockCollapsed, setDockCollapsed] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [content, setContent] = useState("");

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: async (createdPost) => {
      setContent("");
      setComposerOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["feed", "root-posts"] });

      if (location.pathname === "/feed") {
        onRootPostCreated?.(createdPost);
        return;
      }

      navigate("/feed", {
        state: {
          focusPostId: createdPost.id,
          focusPost: createdPost,
          showCreatedToast: true,
        } satisfies FeedFocusNavigationState,
      });
    },
  });

  const trimmedContent = content.trim();
  const canSubmit = trimmedContent.length > 0 && trimmedContent.length <= 500;
  const createPostError = (createPostMutation.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;

  const globalActions = useMemo<AeroDockActionItem[]>(() => {
    const backAction: AeroDockActionItem[] = contextualActions ?? [];

    return [
      {
        id: "new-post",
        label: "New post",
        icon: <Plus aria-hidden="true" size={18} />,
        onActivate: () => {
          createPostMutation.reset();
          setComposerOpen(true);
        },
        tone: "lime",
      },
      ...backAction,
      {
        id: "logout",
        label: "Logout",
        icon: <LogOut aria-hidden="true" size={18} />,
        onActivate: () => {
          logout();
          navigate("/login", { replace: true });
        },
        tone: "violet",
      },
    ];
  }, [contextualActions, createPostMutation, logout, navigate]);

  return (
    <AeroScene className={sceneClassName} contentClassName={`max-w-[116rem] p-4 md:p-6 ${contentClassName ?? ""}`}>
      <AeroDockSidebar actions={globalActions} collapsed={dockCollapsed} onCollapsedChange={setDockCollapsed} />
      <div className={`relative ${dockCollapsed ? "lg:pl-[7.75rem] xl:pl-[8.5rem]" : "lg:pl-[16rem] xl:pl-[16.75rem]"}`}>
        {children}
      </div>

      <AeroModal
        title="Create root post"
        open={composerOpen}
        onClose={() => {
          if (!createPostMutation.isPending) {
            setComposerOpen(false);
          }
        }}
      >
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit) {
              return;
            }
            createPostMutation.mutate({ content: trimmedContent });
          }}
        >
          <label className="sr-only" htmlFor="global-new-post-content">
            Post content
          </label>
          <textarea
            id="global-new-post-content"
            className="aero-input min-h-[180px] resize-y"
            maxLength={500}
            onChange={(event) => setContent(event.currentTarget.value)}
            placeholder="What's new in your graph?"
            required
            value={content}
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-sky-900/75">{content.length}/500</span>
            <div className="flex items-center gap-2">
              <button
                className="aero-pill aero-focus-ring px-4 py-2 text-xs font-semibold text-sky-900"
                disabled={createPostMutation.isPending}
                onClick={() => setComposerOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <GelButton aria-label="Publish post" disabled={!canSubmit || createPostMutation.isPending} type="submit">
                {createPostMutation.isPending ? (
                  <LoaderCircle aria-hidden="true" className="animate-spin" size={14} />
                ) : (
                  <AeroIconBadge className="h-5 w-5" tone="cyan">
                    <Plus aria-hidden="true" size={11} />
                  </AeroIconBadge>
                )}
                Publish
              </GelButton>
            </div>
          </div>
        </form>

        {createPostMutation.isError ? (
          <div className="mt-3">
            <AeroToast message={createPostError ?? "Unable to create post"} variant="error" />
          </div>
        ) : null}
      </AeroModal>
    </AeroScene>
  );
}

export function createBackDockAction(onActivate: () => void): AeroDockActionItem {
  return {
    id: "back",
    label: "Back",
    icon: <ArrowLeft aria-hidden="true" size={18} />,
    onActivate,
    tone: "cyan",
  };
}
