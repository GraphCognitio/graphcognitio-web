import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { LoaderCircle, LogOut, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../../api/postApi";
import { AeroScene } from "../../../components/layout/AeroScene";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";
import { AeroModal } from "../../../components/ui/AeroModal";
import { AeroToast } from "../../../components/ui/AeroToast";
import { GelButton } from "../../../components/ui/GelButton";
import { useAuth } from "../../auth/hooks/useAuth";
import { FeedCanvas } from "../components/FeedCanvas";

type ProblemDetail = {
  detail?: string;
};

export function FeedPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, user } = useAuth();
  const [composerOpen, setComposerOpen] = useState(false);
  const [content, setContent] = useState("");
  const [showCreatedToast, setShowCreatedToast] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: async () => {
      setContent("");
      setComposerOpen(false);
      setShowCreatedToast(true);
      await queryClient.invalidateQueries({ queryKey: ["feed", "root-posts"] });
    },
  });

  useEffect(() => {
    if (!showCreatedToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowCreatedToast(false);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [showCreatedToast]);

  const trimmedContent = content.trim();
  const canSubmit = trimmedContent.length > 0 && trimmedContent.length <= 500;
  const createPostError = (createPostMutation.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;

  return (
    <AeroScene>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="aero-heading text-3xl font-black">GraphCognitio Feed</h1>
          <p className="aero-subtitle text-sm">Infinite pan canvas of root posts</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="aero-pill inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-sky-900">
            <AeroIconBadge className="h-5 w-5" tone="lime">
              <span className="text-[10px] font-black leading-none">U</span>
            </AeroIconBadge>
            {user?.name ?? "Guest"}
          </span>
          <GelButton
            aria-label="Create new post"
            onClick={() => {
              createPostMutation.reset();
              setComposerOpen(true);
            }}
            type="button"
          >
            <AeroIconBadge className="h-5 w-5" tone="cyan">
              <Plus aria-hidden="true" size={11} />
            </AeroIconBadge>
            New post
          </GelButton>
          <GelButton
            aria-label="Logout"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <AeroIconBadge className="h-5 w-5" tone="violet">
              <LogOut aria-hidden="true" size={11} />
            </AeroIconBadge>
            Logout
          </GelButton>
        </div>
      </header>

      {showCreatedToast ? (
        <div className="mb-3 max-w-md">
          <AeroToast message="Post created" variant="success" />
        </div>
      ) : null}

      <FeedCanvas viewerUserId={user?.id ?? null} />

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
          <label className="sr-only" htmlFor="new-post-content">
            Post content
          </label>
          <textarea
            id="new-post-content"
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
              <GelButton
                aria-label="Publish post"
                disabled={!canSubmit || createPostMutation.isPending}
                type="submit"
              >
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
