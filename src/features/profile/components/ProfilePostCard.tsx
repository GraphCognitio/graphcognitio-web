import { Eye, Heart, MessageCircleMore, Network } from "lucide-react";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "../../feed/utils/relativeTime";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";
import type { PostResponse } from "../../feed/types/feedTypes";

interface ProfilePostCardProps {
    post: PostResponse;
}

export function ProfilePostCard({ post }: ProfilePostCardProps) {
    return (
        <article className="aero-glass rounded-[1.6rem] border border-white/55 bg-white/34 p-5 shadow-[0_20px_45px_rgba(14,116,144,0.12)] backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(14,116,144,0.18)] mb-4 w-full">
            <header className="mb-3 flex items-start justify-between">
                <div>
                    <p className="text-sm font-black text-sky-950">{post.authorName}</p>
                    <p className="text-xs font-medium text-sky-900/70">
                        {formatRelativeTime(post.createdAt)}
                        {post.updatedAt && <span className="ml-1 italic opacity-75">(edited)</span>}
                    </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/40 px-2 py-1 text-[11px] font-semibold text-sky-900/90">
                    <AeroIconBadge className="h-4 w-4" tone="cyan">
                        <MessageCircleMore aria-hidden="true" size={9} />
                    </AeroIconBadge>
                    {post.replyCount} replies
                </span>
            </header>

            <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-sky-950/90 line-clamp-4">
                {post.content}
            </p>

            <footer className="flex flex-wrap items-center gap-2 mt-2">
                <div className="aero-pill inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-900">
                    <AeroIconBadge className="h-4 w-4" tone={post.likedByMe ? "rose" : "cyan"}>
                        <Heart aria-hidden="true" size={9} fill={post.likedByMe ? "currentColor" : "none"} />
                    </AeroIconBadge>
                    {post.likeCount}
                </div>

                <Link
                    className="aero-pill aero-focus-ring inline-flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-900 ml-auto"
                    to={`/post/${post.id}`}
                >
                    <AeroIconBadge className="h-4 w-4" tone="cyan">
                        <Eye aria-hidden="true" size={9} />
                    </AeroIconBadge>
                    Open Thread
                </Link>

                <Link
                    className="aero-pill aero-focus-ring inline-flex shrink-0 items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-900"
                    to={`/graph/${post.rootId}`}
                >
                    <AeroIconBadge className="h-4 w-4" tone="violet">
                        <Network aria-hidden="true" size={9} />
                    </AeroIconBadge>
                    Graph
                </Link>
            </footer>
        </article>
    );
}
