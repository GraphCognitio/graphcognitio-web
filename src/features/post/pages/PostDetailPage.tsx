import { type InfiniteData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Heart, LoaderCircle, Network, Reply, SendHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deletePost, getPostById, getRelatedPosts, likePost, replyToPost, unlikePost, updatePost } from "../../../api/postApi";
import { AppShell, createBackDockAction } from "../../../components/layout/AppShell";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";
import { AeroModal } from "../../../components/ui/AeroModal";
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

  const relatedQuery = useQuery({
    queryKey: ["post", id, "related"],
    queryFn: () => getRelatedPosts(id!),
    enabled: Boolean(id),
  });

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editContent, setEditContent] = useState("");

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

  const editMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: async (updatedPost) => {
      setEditModalOpen(false);
      queryClient.setQueryData(["post", id], updatedPost);
      updateFeedCache(updatedPost);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      navigate("/feed");
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
              <header className="mb-4 border-b border-white/35 pb-4 flex items-start justify-between">
                <div>
                  <h1 className="aero-heading text-2xl font-black">{post.authorName}</h1>
                  <p className="aero-subtitle text-sm">
                    {formatRelativeTime(post.createdAt)}
                    {post.updatedAt && <span className="ml-1 italic opacity-75">(edited)</span>}
                    <span className="mx-1">·</span> {post.replyCount} replies
                    <span className="mx-1">·</span> {post.likeCount} likes
                  </p>
                </div>
                {user?.id === post.authorId || user?.role === "ADMIN" ? (
                  <div className="flex items-center gap-2">
                    {user?.id === post.authorId && (
                      <GelButton
                        variant="cyan"
                        className="px-3 py-1.5 text-xs"
                        onClick={() => {
                          setEditContent(post.content);
                          setEditModalOpen(true);
                        }}
                      >
                        Edit
                      </GelButton>
                    )}
                    <GelButton
                      variant="orange"
                      className="px-3 py-1.5 text-xs"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this post?")) {
                          deleteMutation.mutate(post.id);
                        }
                      }}
                    >
                      Delete
                    </GelButton>
                  </div>
                ) : null}
              </header>

              <article className="whitespace-pre-wrap text-[15px] leading-relaxed text-sky-950/95">{post.content}</article>

              <footer className="mt-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/70 bg-white/45 px-3 py-1 text-xs font-semibold text-sky-900">
                  Post ID: {post.id}
                </span>
                <button
                  aria-label={post.likedByMe ? "Unlike post" : "Like post"}
                  className={`aero-pill aero-focus-ring inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold ${post.likedByMe
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
                  <GelButton
                    variant="orange"
                    disabled={replyMutation.isPending || postQuery.isLoading || replyContent.trim().length === 0}
                    onClick={() => {
                      replyMutation.mutate({ postId: parentPostId, content: replyContent.trim() });
                    }}
                    type="button"
                  >
                    Reply parent
                  </GelButton>
                ) : null}

                <GelButton
                  variant="green"
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

      {relatedQuery.data && relatedQuery.data.length > 0 ? (
        <div className="mx-auto mt-6 max-w-5xl">
          <GlassCard>
            <h2 className="aero-heading text-lg font-black mb-4">Related Posts</h2>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {relatedQuery.data.map(rp => (
                <Link key={rp.id} to={`/post/${rp.id}`} className="block">
                  <article className="h-full rounded-[1.25rem] border border-white/40 bg-white/10 px-4 py-3 text-sm text-sky-900 transition-colors hover:bg-white/30">
                    <div className="flex justify-between text-[11px] uppercase tracking-[0.12em] text-sky-900/50">
                      <span className="truncate">{rp.authorName}</span>
                    </div>
                    <div className="mt-2 line-clamp-3 text-xs opacity-90">{rp.content}</div>
                  </article>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : null}

      <AeroModal
        title="Edit post"
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
      >
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (editContent.trim()) {
              editMutation.mutate({ postId: id!, content: editContent.trim() });
            }
          }}
        >
          <textarea
            className="aero-input min-h-[180px] w-full resize-y"
            maxLength={500}
            onChange={(e) => setEditContent(e.currentTarget.value)}
            required
            value={editContent}
          />
          <div className="flex items-center justify-end gap-2 mt-4">
            <GelButton
              variant="orange"
              disabled={editMutation.isPending}
              onClick={() => setEditModalOpen(false)}
              type="button"
            >
              Cancel
            </GelButton>
            <GelButton aria-label="Save changes" variant="green" disabled={editMutation.isPending || !editContent.trim()} type="submit">
              {editMutation.isPending ? <LoaderCircle className="animate-spin" size={14} /> : null}
              Save Changes
            </GelButton>
          </div>
        </form>
      </AeroModal>
    </AppShell>
  );
}
