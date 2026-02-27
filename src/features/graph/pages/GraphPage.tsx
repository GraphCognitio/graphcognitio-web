import "@xyflow/react/dist/style.css";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import { ArrowLeft, Heart, LoaderCircle, Network, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getConversationGraph } from "../../../api/graphApi";
import { getPostById, likePost, unlikePost } from "../../../api/postApi";
import { AeroScene } from "../../../components/layout/AeroScene";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";
import { AeroToast } from "../../../components/ui/AeroToast";
import { GelButton } from "../../../components/ui/GelButton";
import { GlassCard } from "../../../components/ui/GlassCard";
import { formatRelativeTime } from "../../feed/utils/relativeTime";
import { ConversationFlowNode } from "../components/ConversationFlowNode";
import { buildConversationLayout } from "../utils/layoutConversation";
import type {
  ConversationFlowNodeData,
  ConversationNodeResponse,
} from "../types/graphTypes";

type ProblemDetail = {
  detail?: string;
};

type NodeEngagement = {
  likeCount: number;
  likedByMe: boolean;
};

type GraphPosition = {
  x: number;
  y: number;
};

type HandleSide = "top" | "right" | "bottom" | "left";

const INITIAL_DEPTH = 2;
const GRAPH_LIMIT = 120;

function closestHandleSide(from: GraphPosition, to: GraphPosition): HandleSide {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;

  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0 ? "right" : "left";
  }

  return deltaY >= 0 ? "bottom" : "top";
}

function sourceHandleId(side: HandleSide) {
  return `src-${side}`;
}

function targetHandleId(side: HandleSide) {
  return `tgt-${side}`;
}

const nodeTypes: NodeTypes = {
  conversation: ConversationFlowNode,
};

export function GraphPage() {
  const navigate = useNavigate();
  const { rootId } = useParams();
  const [depth, setDepth] = useState(INITIAL_DEPTH);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nodeEngagementById, setNodeEngagementById] = useState<Record<string, NodeEngagement>>({});
  const [pendingLikeById, setPendingLikeById] = useState<Record<string, boolean>>({});
  const [engagementSyncError, setEngagementSyncError] = useState<string | null>(null);
  const [engagementSyncLoading, setEngagementSyncLoading] = useState(false);
  const pendingLikeByIdRef = useRef<Record<string, boolean>>({});

  const graphQuery = useQuery({
    queryKey: ["graph", rootId, depth, GRAPH_LIMIT],
    queryFn: () => getConversationGraph({ rootId: rootId!, depth, limit: GRAPH_LIMIT }),
    enabled: Boolean(rootId),
  });

  const graphNodes = graphQuery.data?.nodes ?? [];
  const graphEdges = graphQuery.data?.edges ?? [];
  const nodeIdsKey = useMemo(() => graphNodes.map((node) => node.id).join("|"), [graphNodes]);

  useEffect(() => {
    pendingLikeByIdRef.current = pendingLikeById;
  }, [pendingLikeById]);

  useEffect(() => {
    let cancelled = false;
    const nodeIds = nodeIdsKey ? nodeIdsKey.split("|") : [];
    if (nodeIds.length === 0) {
      setNodeEngagementById({});
      setPendingLikeById({});
      return;
    }

    const syncEngagement = async () => {
      setEngagementSyncLoading(true);
      setEngagementSyncError(null);
      try {
        const posts = await Promise.all(nodeIds.map((nodeId) => getPostById(nodeId)));
        if (cancelled) {
          return;
        }

        const nextEngagementById: Record<string, NodeEngagement> = {};
        posts.forEach((post) => {
          nextEngagementById[post.id] = {
            likeCount: post.likeCount,
            likedByMe: post.likedByMe,
          };
        });
        setNodeEngagementById(nextEngagementById);
      } catch {
        if (!cancelled) {
          setEngagementSyncError("Unable to load likes for graph nodes");
        }
      } finally {
        if (!cancelled) {
          setEngagementSyncLoading(false);
        }
      }
    };

    void syncEngagement();
    return () => {
      cancelled = true;
    };
  }, [nodeIdsKey]);

  const likeCountByNodeId = useMemo(() => {
    const likeCountMap: Record<string, number> = {};
    graphNodes.forEach((node) => {
      likeCountMap[node.id] = nodeEngagementById[node.id]?.likeCount ?? 0;
    });
    return likeCountMap;
  }, [graphNodes, nodeEngagementById]);

  const handleToggleNodeLike = useCallback(async (postId: string, currentlyLikedByMe: boolean) => {
    if (pendingLikeByIdRef.current[postId]) {
      return;
    }

    setPendingLikeById((current) => ({ ...current, [postId]: true }));
    setEngagementSyncError(null);

    try {
      const updatedPost = currentlyLikedByMe ? await unlikePost(postId) : await likePost(postId);
      setNodeEngagementById((current) => ({
        ...current,
        [postId]: {
          likeCount: updatedPost.likeCount,
          likedByMe: updatedPost.likedByMe,
        },
      }));
    } catch {
      setEngagementSyncError("Unable to update like right now");
    } finally {
      setPendingLikeById((current) => {
        const next = { ...current };
        delete next[postId];
        return next;
      });
    }
  }, []);

  const layout = useMemo(() => {
    return buildConversationLayout(graphNodes, likeCountByNodeId);
  }, [graphNodes, likeCountByNodeId]);

  const flowNodes = useMemo<Node<ConversationFlowNodeData>[]>(() => {
    return graphNodes.map((node) => {
      const position = layout.get(node.id) ?? { x: 0, y: 0 };
      const nodeEngagement = nodeEngagementById[node.id] ?? { likeCount: 0, likedByMe: false };
      return {
        id: node.id,
        type: "conversation",
        position,
        data: {
          id: node.id,
          authorName: node.authorName,
          contentPreview: node.contentPreview,
          createdAt: node.createdAt,
          replyCount: node.replyCount,
          likeCount: nodeEngagement.likeCount,
          likedByMe: nodeEngagement.likedByMe,
          isRoot: node.parentId === null,
          likePending: Boolean(pendingLikeById[node.id]),
          onToggleLike: handleToggleNodeLike,
        },
      };
    });
  }, [graphNodes, handleToggleNodeLike, layout, nodeEngagementById, pendingLikeById]);

  const flowEdges = useMemo<Edge[]>(() => {
    return graphEdges.map((edge) => {
      const sourcePosition = layout.get(edge.sourcePostId) ?? { x: 0, y: 0 };
      const targetPosition = layout.get(edge.targetPostId) ?? { x: 0, y: 0 };
      const sourceSide = closestHandleSide(sourcePosition, targetPosition);
      const targetSide = closestHandleSide(targetPosition, sourcePosition);

      return {
        id: edge.id,
        source: edge.sourcePostId,
        target: edge.targetPostId,
        sourceHandle: sourceHandleId(sourceSide),
        targetHandle: targetHandleId(targetSide),
        type: "smoothstep",
        pathOptions: {
          offset: 95,
          borderRadius: 44,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#1ea8e8",
        },
        style: {
          stroke: "#1ea8e8",
          strokeWidth: 2.4,
          opacity: 0.86,
        },
        animated: false,
        interactionWidth: 28,
      };
    });
  }, [graphEdges, layout]);

  const selectedNode: ConversationNodeResponse | null =
    graphNodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedNodeEngagement = selectedNode
    ? nodeEngagementById[selectedNode.id] ?? { likeCount: 0, likedByMe: false }
    : null;
  const selectedNodeLikePending = selectedNode ? Boolean(pendingLikeById[selectedNode.id]) : false;

  if (!rootId) {
    return (
      <AeroScene>
        <GlassCard className="mx-auto mt-8 max-w-2xl">
          <AeroToast message="Invalid root id" variant="error" />
        </GlassCard>
      </AeroScene>
    );
  }

  const graphError = (graphQuery.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;

  return (
    <AeroScene>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="aero-heading text-3xl font-black">Conversation Graph</h1>
          <p className="aero-subtitle text-sm">
            Root: {rootId} · depth {depth} · limit {GRAPH_LIMIT} · radial layers by likes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Go back"
            className="aero-pill aero-focus-ring inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-sky-900"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
                return;
              }
              navigate("/feed");
            }}
            type="button"
          >
            <AeroIconBadge className="h-4 w-4" tone="violet">
              <ArrowLeft aria-hidden="true" size={9} />
            </AeroIconBadge>
            Back
          </button>
          <GelButton aria-label="Increase graph depth" onClick={() => setDepth((current) => current + 1)} type="button">
            <AeroIconBadge className="h-5 w-5" tone="cyan">
              <Plus aria-hidden="true" size={11} />
            </AeroIconBadge>
            Expand depth
          </GelButton>
        </div>
      </header>

      <GlassCard className="relative min-h-[70vh] overflow-hidden p-0">
        {graphQuery.isLoading ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-sky-900/12 backdrop-blur-[2px]">
            <div className="aero-glass flex items-center gap-2 px-4 py-3 text-sm font-semibold text-sky-900">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
              Loading graph
            </div>
          </div>
        ) : null}

        {graphQuery.isError ? (
          <div className="absolute left-4 top-4 z-30 max-w-md">
            <AeroToast message={graphError ?? "Unable to load graph"} variant="error" />
          </div>
        ) : null}
        {engagementSyncError ? (
          <div className="absolute left-4 top-[4.5rem] z-30 max-w-md">
            <AeroToast message={engagementSyncError} variant="error" />
          </div>
        ) : null}
        {engagementSyncLoading ? (
          <div className="absolute right-4 bottom-4 z-30">
            <div className="aero-glass inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-sky-900">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={12} />
              Syncing likes
            </div>
          </div>
        ) : null}

        <div className="h-[70vh] w-full">
          <ReactFlow
            fitView
            fitViewOptions={{ padding: 0.26 }}
            edges={flowEdges}
            nodes={flowNodes}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            nodesDraggable={false}
            panOnDrag
            panOnScroll={false}
            zoomOnScroll
            className="bg-transparent"
          >
            <MiniMap
              pannable
              zoomable
              className="!rounded-2xl !border !border-white/70 !bg-white/45 !backdrop-blur-md"
              nodeColor={() => "#63c8f5"}
            />
            <Controls className="!rounded-2xl !border !border-white/70 !bg-white/45 !backdrop-blur-md" />
            <Background color="#7ecdfa" gap={32} size={1.2} />
          </ReactFlow>
        </div>

        {selectedNode ? (
          <aside className="aero-glass absolute right-4 top-4 z-30 w-[min(360px,calc(100%-2rem))] p-4">
            <header className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="aero-heading text-lg font-black">Node preview</h2>
                <p className="text-xs text-sky-900/75">{formatRelativeTime(selectedNode.createdAt)}</p>
              </div>
              <button
                aria-label="Close node panel"
                className="aero-pill aero-focus-ring px-3 py-1 text-xs font-bold text-sky-900"
                onClick={() => setSelectedNodeId(null)}
                type="button"
              >
                Close
              </button>
            </header>

            <p className="mb-1 text-sm font-bold text-sky-900">{selectedNode.authorName}</p>
            <p className="mb-3 text-sm leading-relaxed text-sky-950/92">{selectedNode.contentPreview}</p>
            <div className="mb-3 inline-flex items-center rounded-full border border-white/70 bg-white/45 px-3 py-1 text-xs font-semibold text-sky-900">
              {selectedNodeEngagement?.likeCount ?? 0} likes
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                aria-label={selectedNodeEngagement?.likedByMe ? "Unlike reply" : "Like reply"}
                className={`aero-pill aero-focus-ring inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold ${
                  selectedNodeEngagement?.likedByMe
                    ? "text-rose-600"
                    : "text-sky-900"
                }`}
                disabled={selectedNodeLikePending}
                onClick={() => handleToggleNodeLike(selectedNode.id, Boolean(selectedNodeEngagement?.likedByMe))}
                type="button"
              >
                <AeroIconBadge className="h-4 w-4" tone={selectedNodeEngagement?.likedByMe ? "rose" : "cyan"}>
                  <Heart aria-hidden="true" size={9} fill={selectedNodeEngagement?.likedByMe ? "currentColor" : "none"} />
                </AeroIconBadge>
                {selectedNodeEngagement?.likeCount ?? 0}
              </button>
              <Link className="aero-gel aero-focus-ring inline-flex items-center gap-1 px-4 py-2 text-xs" to={`/post/${selectedNode.id}`}>
                <AeroIconBadge className="h-4 w-4" tone="cyan">
                  <Network aria-hidden="true" size={9} />
                </AeroIconBadge>
                Open post
              </Link>
              <button
                aria-label="Expand graph depth"
                className="aero-pill aero-focus-ring inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-sky-900"
                onClick={() => setDepth((current) => current + 1)}
                type="button"
              >
                <AeroIconBadge className="h-4 w-4" tone="violet">
                  <Network aria-hidden="true" size={9} />
                </AeroIconBadge>
                Expand
              </button>
            </div>
          </aside>
        ) : null}
      </GlassCard>
    </AeroScene>
  );
}
