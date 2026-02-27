import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Heart } from "lucide-react";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";
import type { ConversationFlowNodeData } from "../types/graphTypes";
import { formatRelativeTime } from "../../feed/utils/relativeTime";

export function ConversationFlowNode({ data: unsafeData, selected }: NodeProps) {
  const data = unsafeData as ConversationFlowNodeData;

  return (
    <article
      className={`aero-glass w-[280px] p-3 ${data.isRoot ? "border-cyan-200/90 bg-cyan-50/30" : ""}`}
      style={{
        borderColor: selected
          ? "rgba(32,155,227,0.85)"
          : data.isRoot
            ? "rgba(129,226,255,0.84)"
            : undefined,
        boxShadow: selected
          ? "inset 0 1px 0 rgba(255,255,255,0.62), 0 0 0 2px rgba(92,216,255,0.5), 0 22px 36px -20px rgba(11,90,146,0.3)"
          : data.isRoot
            ? "inset 0 1px 0 rgba(255,255,255,0.62), 0 0 0 2px rgba(92,216,255,0.32), 0 22px 36px -20px rgba(11,90,146,0.3)"
            : undefined,
      }}
    >
      <Handle id="tgt-top" className="nodrag nopan !h-2 !w-2 !border-0 !bg-transparent !opacity-0 !pointer-events-none" type="target" position={Position.Top} />
      <Handle id="tgt-right" className="nodrag nopan !h-2 !w-2 !border-0 !bg-transparent !opacity-0 !pointer-events-none" type="target" position={Position.Right} />
      <Handle id="tgt-bottom" className="nodrag nopan !h-2 !w-2 !border-0 !bg-transparent !opacity-0 !pointer-events-none" type="target" position={Position.Bottom} />
      <Handle id="tgt-left" className="nodrag nopan !h-2 !w-2 !border-0 !bg-transparent !opacity-0 !pointer-events-none" type="target" position={Position.Left} />

      <Handle id="src-top" className="nodrag nopan !h-2 !w-2 !border-0 !bg-transparent !opacity-0 !pointer-events-none" type="source" position={Position.Top} />
      <Handle id="src-right" className="nodrag nopan !h-2 !w-2 !border-0 !bg-transparent !opacity-0 !pointer-events-none" type="source" position={Position.Right} />
      <Handle id="src-bottom" className="nodrag nopan !h-2 !w-2 !border-0 !bg-transparent !opacity-0 !pointer-events-none" type="source" position={Position.Bottom} />
      <Handle id="src-left" className="nodrag nopan !h-2 !w-2 !border-0 !bg-transparent !opacity-0 !pointer-events-none" type="source" position={Position.Left} />

      <div className="flex items-start justify-between gap-2">
        <p className="aero-heading text-sm font-black">{data.authorName}</p>
        {data.isRoot ? (
          <span className="rounded-full border border-cyan-200/90 bg-cyan-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-cyan-700">
            Root
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[11px] font-semibold text-sky-900/70">{formatRelativeTime(data.createdAt)}</p>
      <p className="mt-3 line-clamp-4 text-sm font-medium text-sky-950/95">{data.contentPreview}</p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="inline-flex rounded-full border border-white/70 bg-white/40 px-2 py-1 text-[11px] font-semibold text-sky-900/85">
          {data.replyCount} replies
        </p>
        <button
          aria-label={data.likedByMe ? `Unlike reply ${data.id}` : `Like reply ${data.id}`}
          className={`aero-pill nodrag nopan nowheel inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold ${
            data.likedByMe
              ? "text-rose-600"
              : "text-sky-900"
          }`}
          disabled={data.likePending}
          onClick={(event) => {
            event.stopPropagation();
            data.onToggleLike(data.id, data.likedByMe);
          }}
          type="button"
        >
          <AeroIconBadge className="h-4 w-4" tone={data.likedByMe ? "rose" : "cyan"}>
            <Heart aria-hidden="true" size={9} fill={data.likedByMe ? "currentColor" : "none"} />
          </AeroIconBadge>
          {data.likeCount}
        </button>
      </div>
    </article>
  );
}
