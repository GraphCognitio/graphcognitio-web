import { type InfiniteData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Heart, LoaderCircle, Network, Reply, SendHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPostById, likePost, replyToPost, unlikePost } from "../../../api/postApi";
import { AppShell, createBackDockAction } from "../../../components/layout/AppShell";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";
import { AeroToast } from "../../../components/ui/AeroToast";
import { GelButton } from "../../../components/ui/GelButton";
import { GlassCard } from "../../../components/ui/GlassCard";
import { useAuth } from "../../auth/hooks/useAuth";
import { touchRecentPost } from "../../feed/storage/recentPostsStorage";
import type { FeedResponse, PostResponse } from "../../feed/types/feedTypes";
import { formatRelativeTime } from "../../feed/utils/relativeTime";

type ProblemDetail = {
  detail?: string;
};

export function PostDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");

  const postQuery = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id!),
    enabled: Boolean(id),
  });

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

  const replyMutation = useMutation({
    mutationFn: replyToPost,
    onSuccess: async () => {
      setReplyContent("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["post", id] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "root-posts"] }),
      ]);
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!id) {
        throw new Error("Invalid post id");
      }

      if (postQuery.data?.likedByMe) {
        return unlikePost(id);
      }
      return likePost(id);
    },
    onSuccess: async (updatedPost) => {
      if (!id) {
        return;
      }

      queryClient.setQueryData(["post", id], updatedPost);
      updateFeedCache(updatedPost);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["post", id] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "root-posts"] }),
      ]);
    },
  });

  if (!id) {
    return (
      <AppShell>
        <GlassCard className="mx-auto mt-8 max-w-2xl">
          <AeroToast message="Invalid post id" variant="error" />
        </GlassCard>
      </AppShell>
    );
  }

  const post = postQuery.data;

  useEffect(() => {
    if (!user?.id || !post) {
      return;
    }

    touchRecentPost(user.id, post);
  }, [post, user?.id]);

  const canOpenGraph = Boolean(post && post.parentId === null);
  const parentPostId = post?.parentId ?? null;
  const replyError = (replyMutation.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;
  const postError = (postQuery.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;
  return (
    <AppShell
      contextualActions={[
        createBackDockAction(() => {
          if (window.history.length > 1) {
            navigate(-1);
            return;
          }
          navigate("/feed");
        }),
      ]}
    >
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[2fr_1fr]">
        <GlassCard>
          {postQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-900">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={15} />
              Loading post
            </div>
          ) : null}

          {postQuery.isError ? (
            <AeroToast message={postError ?? "Unable to load post"} variant="error" />
          ) : null}

          {post ? (
            <>
              <header className="mb-4 border-b border-white/35 pb-4">
                <h1 className="aero-heading text-2xl font-black">{post.authorName}</h1>
                <p className="aero-subtitle text-sm">
                  {formatRelativeTime(post.createdAt)} · {post.replyCount} replies · {post.likeCount} likes
                </p>
              </header>

              <article className="whitespace-pre-wrap text-[15px] leading-relaxed text-sky-950/95">{post.content}</article>

              <footer className="mt-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/70 bg-white/45 px-3 py-1 text-xs font-semibold text-sky-900">
                  Post ID: {post.id}
                </span>
                <button
                  aria-label={post.likedByMe ? "Unlike post" : "Like post"}
                  className={`aero-pill aero-focus-ring inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold ${
                    post.likedByMe
                      ? "text-rose-600"
                      : "text-sky-900"
                  }`}
                  disabled={likeMutation.isPending}
                  onClick={() => likeMutation.mutate()}
                  type="button"
                >
                  <AeroIconBadge className="h-4 w-4" tone={post.likedByMe ? "rose" : "cyan"}>
                    <Heart aria-hidden="true" size={9} fill={post.likedByMe ? "currentColor" : "none"} />
                  </AeroIconBadge>
                  {post.likeCount}
                </button>
                {canOpenGraph ? (
                  <Link
                    className="aero-gel aero-focus-ring inline-flex items-center gap-1 px-4 py-2 text-xs"
                    to={`/graph/${post.rootId}`}
                  >
                    <AeroIconBadge className="h-4 w-4" tone="violet">
                      <Network aria-hidden="true" size={9} />
                    </AeroIconBadge>
                    Open graph
                  </Link>
                ) : null}
              </footer>
            </>
          ) : null}
        </GlassCard>

        <GlassCard>
          <header className="mb-3 flex items-center gap-2">
            <AeroIconBadge className="h-5 w-5" tone="cyan">
              <Reply aria-hidden="true" size={11} />
            </AeroIconBadge>
            <h2 className="aero-heading text-lg font-black">Reply</h2>
          </header>

          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!id) {
                return;
              }
              replyMutation.mutate({ postId: id, content: replyContent.trim() });
            }}
          >
            <label className="sr-only" htmlFor="reply-content">
              Reply content
            </label>
            <textarea
              id="reply-content"
              className="aero-input min-h-[180px] resize-y"
              maxLength={500}
              onChange={(event) => setReplyContent(event.currentTarget.value)}
              placeholder="Write your reply..."
              required
              value={replyContent}
            />

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-sky-900/75">{replyContent.length}/500</span>
              <div className="flex items-center gap-2">
                {parentPostId ? (
                  <button
                    className="aero-pill aero-focus-ring px-4 py-2 text-xs font-semibold text-sky-900"
                    disabled={replyMutation.isPending || postQuery.isLoading || replyContent.trim().length === 0}
                    onClick={() => {
                      replyMutation.mutate({ postId: parentPostId, content: replyContent.trim() });
                    }}
                    type="button"
                  >
                    Reply parent
                  </button>
                ) : null}

                <GelButton
                  aria-label="Send reply"
                  disabled={replyMutation.isPending || postQuery.isLoading || replyContent.trim().length === 0}
                  type="submit"
                >
                  {replyMutation.isPending ? (
                    <LoaderCircle aria-hidden="true" className="animate-spin" size={14} />
                  ) : (
                    <AeroIconBadge className="h-4 w-4" tone="cyan">
                      <SendHorizontal aria-hidden="true" size={9} />
                    </AeroIconBadge>
                  )}
                  Send
                </GelButton>
              </div>
            </div>
          </form>

          {replyMutation.isError ? <AeroToast message={replyError ?? "Unable to reply"} variant="error" /> : null}
          {replyMutation.isSuccess ? <AeroToast message="Reply sent" variant="success" /> : null}
        </GlassCard>
      </div>
    </AppShell>
  );
}
