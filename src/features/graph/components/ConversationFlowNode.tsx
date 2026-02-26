import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ConversationFlowNodeData } from "../types/graphTypes";
import { formatRelativeTime } from "../../feed/utils/relativeTime";

export function ConversationFlowNode({ data: unsafeData, selected }: NodeProps) {
  const data = unsafeData as ConversationFlowNodeData;

  return (
    <article
      className="aero-glass w-[280px] p-3"
      style={{
        borderColor: selected ? "rgba(32,155,227,0.85)" : undefined,
        boxShadow: selected
          ? "inset 0 1px 0 rgba(255,255,255,0.62), 0 0 0 2px rgba(92,216,255,0.5), 0 22px 36px -20px rgba(11,90,146,0.3)"
          : undefined,
      }}
    >
      <Handle className="!h-2 !w-2 !border-0 !bg-cyan-200" type="target" position={Position.Bottom} />
      <Handle className="!h-2 !w-2 !border-0 !bg-cyan-200" type="source" position={Position.Top} />

      <p className="aero-heading text-sm font-black">{data.authorName}</p>
      <p className="mt-1 text-[11px] font-semibold text-sky-900/70">{formatRelativeTime(data.createdAt)}</p>
      <p className="mt-3 line-clamp-4 text-sm font-medium text-sky-950/95">{data.contentPreview}</p>
      <p className="mt-3 inline-flex rounded-full border border-white/70 bg-white/40 px-2 py-1 text-[11px] font-semibold text-sky-900/85">
        {data.replyCount} replies
      </p>
    </article>
  );
}
