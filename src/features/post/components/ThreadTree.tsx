import { CornerDownRight, Eye, MessageCircleMore, PencilLine, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";
import { AeroToast } from "../../../components/ui/AeroToast";
import { GelButton } from "../../../components/ui/GelButton";
import type { AuthRole } from "../../auth/types/authTypes";
import type { PostResponse } from "../../feed/types/feedTypes";
import { formatRelativeTime } from "../../feed/utils/relativeTime";
import { canDeletePost, canEditPost } from "../utils/postPermissions";
import type { ThreadNodeResponse } from "../types/threadTypes";

type ThreadTreeProps = {
  currentUserId: string | null;
  currentUserRole: AuthRole | null;
  nodes: ThreadNodeResponse[];
  onDeletePost: (post: PostResponse) => Promise<void>;
  onReplyTargetSelect: (post: PostResponse) => void;
  onUpdatePost: (post: PostResponse, content: string) => Promise<void>;
  selectedReplyTargetId: string | null;
};

type ThreadBranchProps = {
  currentUserId: string | null;
  currentUserRole: AuthRole | null;
  node: ThreadNodeResponse;
  depth: number;
  onDeletePost: (post: PostResponse) => Promise<void>;
  onReplyTargetSelect: (post: PostResponse) => void;
  onUpdatePost: (post: PostResponse, content: string) => Promise<void>;
  selectedReplyTargetId: string | null;
};

export function ThreadTree({
  currentUserId,
  currentUserRole,
  nodes,
  onDeletePost,
  onReplyTargetSelect,
  onUpdatePost,
  selectedReplyTargetId,
}: ThreadTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="rounded-[1.4rem] border border-dashed border-white/45 bg-white/20 px-4 py-5 text-sm font-medium text-sky-900/75">
        No replies yet for this node.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {nodes.map((node) => (
        <ThreadBranch
          key={node.post.id}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          depth={0}
          node={node}
          onDeletePost={onDeletePost}
          onReplyTargetSelect={onReplyTargetSelect}
          onUpdatePost={onUpdatePost}
          selectedReplyTargetId={selectedReplyTargetId}
        />
      ))}
    </div>
  );
}

function ThreadBranch({
  currentUserId,
  currentUserRole,
  node,
  depth,
  onDeletePost,
  onReplyTargetSelect,
  onUpdatePost,
  selectedReplyTargetId,
}: ThreadBranchProps) {
  const isSelected = selectedReplyTargetId === node.post.id;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.post.content);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"update" | "delete" | null>(null);
  const canEdit = canEditPost(node.post, currentUserId);
  const canDelete = canDeletePost(node.post, currentUserId, currentUserRole);
  const deleteBlockedByReplies = node.post.replyCount > 0;

  useEffect(() => {
    setEditContent(node.post.content);
    setIsEditing(false);
  }, [node.post.content]);

  return (
    <div className="space-y-3">
      <article
        className={`rounded-[1.6rem] border px-4 py-4 shadow-[0_20px_45px_rgba(14,116,144,0.12)] backdrop-blur-md ${isSelected
          ? "border-cyan-200/95 bg-cyan-50/55"
          : "border-white/55 bg-white/34"
          }`}
        style={{ marginLeft: `${depth * 22}px` }}
      >
        <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-sky-950">{node.post.authorName}</p>
            <p className="text-xs font-medium text-sky-900/70">
              {formatRelativeTime(node.post.createdAt)} · {node.post.replyCount} replies · {node.post.likeCount} likes
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {deleteBlockedByReplies && canDelete ? (
              <span className="rounded-full border border-amber-200/80 bg-amber-100/75 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-800">
                Replies lock
              </span>
            ) : null}
            {isSelected ? (
              <span className="rounded-full border border-cyan-200/90 bg-cyan-100/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-800">
                Reply target
              </span>
            ) : null}
          </div>
        </header>

        {isEditing ? (
          <div className="mb-3 space-y-2">
            <label className="sr-only" htmlFor={`thread-edit-${node.post.id}`}>
              Edit reply
            </label>
            <textarea
              id={`thread-edit-${node.post.id}`}
              className="aero-input min-h-[140px] resize-y"
              maxLength={500}
              onChange={(event) => setEditContent(event.currentTarget.value)}
              value={editContent}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-sky-900/75">{editContent.length}/500</span>
              <div className="flex items-center gap-2">
                <GelButton
                  variant="orange"
                  className="px-3 py-2 text-xs"
                  disabled={pendingAction === "update"}
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(node.post.content);
                    setActionError(null);
                  }}
                  type="button"
                >
                  Cancel
                </GelButton>
                <GelButton
                  variant="green"
                  className="px-3 py-2 text-xs"
                  disabled={pendingAction === "update" || editContent.trim().length === 0}
                  onClick={async () => {
                    try {
                      setPendingAction("update");
                      setActionError(null);
                      await onUpdatePost(node.post, editContent.trim());
                      setIsEditing(false);
                    } catch {
                      setActionError("Unable to update reply");
                    } finally {
                      setPendingAction(null);
                    }
                  }}
                  type="button"
                >
                  Save
                </GelButton>
              </div>
            </div>
          </div>
        ) : (
          <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-sky-950/90">{node.post.content}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            className="aero-pill aero-focus-ring inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-sky-900"
            onClick={() => onReplyTargetSelect(node.post)}
            type="button"
          >
            <AeroIconBadge className="h-4 w-4" tone="cyan">
              <MessageCircleMore aria-hidden="true" size={9} />
            </AeroIconBadge>
            Reply here
          </button>
          <Link
            className="aero-pill aero-focus-ring inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-sky-900"
            to={`/post/${node.post.id}`}
          >
            <AeroIconBadge className="h-4 w-4" tone="violet">
              <Eye aria-hidden="true" size={9} />
            </AeroIconBadge>
            Open
          </Link>
          {canEdit ? (
            <GelButton
              variant="cyan"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs"
              disabled={pendingAction !== null}
              onClick={() => {
                setIsEditing((current) => !current);
                setEditContent(node.post.content);
                setActionError(null);
              }}
              type="button"
            >
              <AeroIconBadge className="h-4 w-4" tone="cyan">
                <PencilLine aria-hidden="true" size={9} />
              </AeroIconBadge>
              Edit
            </GelButton>
          ) : null}
          {canDelete ? (
            <GelButton
              variant="orange"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs"
              disabled={pendingAction !== null || deleteBlockedByReplies}
              onClick={async () => {
                if (!window.confirm("Delete this reply permanently?")) {
                  return;
                }

                try {
                  setPendingAction("delete");
                  setActionError(null);
                  await onDeletePost(node.post);
                } catch {
                  setActionError("Unable to delete reply");
                } finally {
                  setPendingAction(null);
                }
              }}
              type="button"
            >
              <AeroIconBadge className="h-4 w-4" tone="rose">
                <Trash2 aria-hidden="true" size={9} />
              </AeroIconBadge>
              Delete
            </GelButton>
          ) : null}
        </div>

        {actionError ? <div className="mt-3"><AeroToast message={actionError} variant="error" /></div> : null}
      </article>

      {node.replies.length > 0 ? (
        <div className="space-y-3">
          {node.replies.map((child) => (
            <div key={child.post.id} className="relative">
              <div
                aria-hidden="true"
                className="absolute left-[10px] top-0 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-cyan-300/80 via-white/60 to-transparent"
                style={{ marginLeft: `${depth * 22}px` }}
              />
              <div
                className="absolute left-[10px] top-5 text-cyan-700/80"
                style={{ marginLeft: `${depth * 22}px` }}
              >
                <CornerDownRight size={14} />
              </div>
              <ThreadBranch
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                depth={depth + 1}
                node={child}
                onDeletePost={onDeletePost}
                onReplyTargetSelect={onReplyTargetSelect}
                onUpdatePost={onUpdatePost}
                selectedReplyTargetId={selectedReplyTargetId}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
