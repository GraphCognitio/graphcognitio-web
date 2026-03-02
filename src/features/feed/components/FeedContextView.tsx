import { LoaderCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFeedContext } from "../../../api/feedApi";
import { AeroToast } from "../../../components/ui/AeroToast";
import { GlassCard } from "../../../components/ui/GlassCard";
import type { ContextFeedResponse } from "../types/feedTypes";

export function FeedContextView() {
  const { data, isLoading, isError } = useQuery<ContextFeedResponse>({
    queryKey: ["feed", "context"],
    queryFn: () => getFeedContext(3),
  });

  const clusters = data?.clusters ?? [];

  if (isLoading) {
    return (
      <div className="rounded-[1.6rem] border border-white/35 bg-white/20 p-6 text-sm font-semibold text-sky-900">
        <LoaderCircle className="animate-spin" size={16} />
        Loading contextual feed...
      </div>
    );
  }

  if (isError) {
    return (
      <AeroToast message="Unable to load contextual feed" variant="error" />
    );
  }

  return (
    <div className="space-y-4">
      {clusters.map((cluster) => (
        <GlassCard key={cluster.mainTopic}>
          <header className="flex flex-wrap items-center justify-between gap-2 pb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-sky-900/60">Topic cluster</p>
              <h3 className="text-lg font-black text-sky-950">{cluster.mainTopic}</h3>
            </div>
          </header>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-sky-900/70">
            {cluster.topicKeywords.map((keyword) => (
              <span key={keyword} className="rounded-full border border-white/45 bg-white/30 px-3 py-1">
                {keyword}
              </span>
            ))}
          </div>
          <div className="mt-3 space-y-3">
            {cluster.highlights.map((post) => (
              <article key={post.id} className="rounded-[1.25rem] border border-white/40 bg-white/10 px-4 py-3 text-sm text-sky-900">
                <div className="flex justify-between text-[11px] uppercase tracking-[0.12em] text-sky-900/50">
                  <span>{post.authorName}</span>
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs font-black">
                  <span className="text-sky-900/80">Likes: {post.likeCount}</span>
                  <span className="text-sky-900/80">Replies: {post.replyCount}</span>
                </div>
              </article>
            ))}
          </div>
        </GlassCard>
      ))}
      {!clusters.length ? (
        <div className="rounded-[1.4rem] border border-dashed border-white/45 bg-white/20 px-4 py-5 text-sm text-sky-900/75">
          No contextual clusters available right now.
        </div>
      ) : null}
    </div>
  );
}
