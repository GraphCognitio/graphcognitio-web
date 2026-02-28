import "@xyflow/react/dist/style.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type ReactFlowInstance,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import { Heart, LoaderCircle, Network, Plus, Reply, SendHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getConversationGraph } from "../../../api/graphApi";
import { getPostById, likePost, replyToPost, unlikePost } from "../../../api/postApi";
import { AppShell, createBackDockAction } from "../../../components/layout/AppShell";
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
type LaneSlot = "0" | "1" | "2";
type PendingNodeFocus = {
  nodeId: string;
  expandedDepthOnce: boolean;
};

const INITIAL_DEPTH = 2;
const GRAPH_LIMIT = 120;
const EDGE_COLOR_PALETTE = [
  "#1ea8e8",
  "#38c9ff",
  "#51d5b0",
  "#79d64a",
  "#a97cff",
  "#ff92d1",
  "#f5c86b",
];

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function edgeColorById(edgeId: string) {
  return EDGE_COLOR_PALETTE[hashString(edgeId) % EDGE_COLOR_PALETTE.length];
}

function closestHandleSide(from: GraphPosition, to: GraphPosition): HandleSide {
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;

  if (Math.abs(deltaX) >= Math.abs(deltaY)) {
    return deltaX >= 0 ? "right" : "left";
  }

  return deltaY >= 0 ? "bottom" : "top";
}

function centeredLaneFromIndex(index: number, count: number) {
  return index - (count - 1) / 2;
}

function laneSlotFromCenteredLane(centeredLane: number): LaneSlot {
  if (centeredLane <= -0.35) {
    return "0";
  }
  if (centeredLane >= 0.35) {
    return "2";
  }
  return "1";
}

function sourceHandleId(side: HandleSide, laneSlot: LaneSlot) {
  return `src-${side}-${laneSlot}`;
}

function targetHandleId(side: HandleSide, laneSlot: LaneSlot) {
  return `tgt-${side}-${laneSlot}`;
}

const nodeTypes: NodeTypes = {
  conversation: ConversationFlowNode,
};

export function GraphPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { rootId } = useParams();
  const [depth, setDepth] = useState(INITIAL_DEPTH);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [nodeEngagementById, setNodeEngagementById] = useState<Record<string, NodeEngagement>>({});
  const [layoutLikeCountByNodeId, setLayoutLikeCountByNodeId] = useState<Record<string, number>>({});
  const [pendingLikeById, setPendingLikeById] = useState<Record<string, boolean>>({});
  const [pendingNodeFocus, setPendingNodeFocus] = useState<PendingNodeFocus | null>(null);
  const [engagementSyncError, setEngagementSyncError] = useState<string | null>(null);
  const [engagementSyncLoading, setEngagementSyncLoading] = useState(false);
  const pendingLikeByIdRef = useRef<Record<string, boolean>>({});
  const reactFlowRef = useRef<ReactFlowInstance<Node<ConversationFlowNodeData>, Edge> | null>(null);

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
      setLayoutLikeCountByNodeId({});
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
        const nextLayoutLikeCounts: Record<string, number> = {};
        posts.forEach((post) => {
          nextEngagementById[post.id] = {
            likeCount: post.likeCount,
            likedByMe: post.likedByMe,
          };
          nextLayoutLikeCounts[post.id] = post.likeCount;
        });
        setNodeEngagementById(nextEngagementById);
        setLayoutLikeCountByNodeId(nextLayoutLikeCounts);
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

  const replyMutation = useMutation({
    mutationFn: replyToPost,
    onSuccess: async (createdReply, variables) => {
      setReplyContent("");
      setPendingNodeFocus({ nodeId: createdReply.id, expandedDepthOnce: false });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["graph", rootId] }),
        queryClient.invalidateQueries({ queryKey: ["post", variables.postId] }),
        queryClient.invalidateQueries({ queryKey: ["feed", "root-posts"] }),
      ]);
    },
  });

  const layout = useMemo(() => {
    return buildConversationLayout(graphNodes, layoutLikeCountByNodeId);
  }, [graphNodes, layoutLikeCountByNodeId]);

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
    const edgeGeometry = graphEdges.map((edge) => {
      const sourcePosition = layout.get(edge.sourcePostId) ?? { x: 0, y: 0 };
      const targetPosition = layout.get(edge.targetPostId) ?? { x: 0, y: 0 };
      const sourceSide = closestHandleSide(sourcePosition, targetPosition);
      const targetSide = closestHandleSide(targetPosition, sourcePosition);
      const edgeColor = edgeColorById(edge.id);
      const sourceAngle = Math.atan2(sourcePosition.y - targetPosition.y, sourcePosition.x - targetPosition.x);

      return {
        edge,
        sourceSide,
        targetSide,
        edgeColor,
        sourceAngle,
      };
    });

    const laneByEdgeId = new Map<string, number>();
    const incomingGroups = new Map<string, typeof edgeGeometry>();

    edgeGeometry.forEach((meta) => {
      const groupKey = `${meta.edge.targetPostId}:${meta.targetSide}`;
      const group = incomingGroups.get(groupKey) ?? [];
      group.push(meta);
      incomingGroups.set(groupKey, group);
    });

    incomingGroups.forEach((group) => {
      group.sort((metaA, metaB) => metaA.sourceAngle - metaB.sourceAngle);
      group.forEach((meta, index) => {
        laneByEdgeId.set(meta.edge.id, centeredLaneFromIndex(index, group.length));
      });
    });

    return edgeGeometry.map((meta) => {
      const centeredLane = laneByEdgeId.get(meta.edge.id) ?? 0;
      const laneSlot = laneSlotFromCenteredLane(centeredLane);
      const laneMagnitude = Math.min(2.2, Math.abs(centeredLane));
      const edgeSeed = hashString(`${meta.edge.id}:edge`);
      const strokeWidth = 2 + (edgeSeed % 4) * 0.25;
      const offset = 86 + Math.round(laneMagnitude * 36) + (edgeSeed % 8);
      const borderRadius = 32 + Math.round(laneMagnitude * 18);

      return {
        id: meta.edge.id,
        source: meta.edge.sourcePostId,
        target: meta.edge.targetPostId,
        sourceHandle: sourceHandleId(meta.sourceSide, laneSlot),
        targetHandle: targetHandleId(meta.targetSide, laneSlot),
        type: "smoothstep",
        pathOptions: {
          offset,
          borderRadius,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: meta.edgeColor,
        },
        style: {
          stroke: meta.edgeColor,
          strokeWidth,
          opacity: 0.9,
        },
        zIndex: 10 + Math.round(laneMagnitude * 3),
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
  const trimmedReply = replyContent.trim();
  const canSubmitReply = Boolean(selectedNode && trimmedReply.length > 0 && trimmedReply.length <= 500);
  const replyError = (replyMutation.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;

  useEffect(() => {
    if (!pendingNodeFocus) {
      return;
    }

    const targetNode = flowNodes.find((node) => node.id === pendingNodeFocus.nodeId);
    if (targetNode) {
      setSelectedNodeId(targetNode.id);

      const flowInstance = reactFlowRef.current;
      if (flowInstance) {
        const currentZoom = flowInstance.getZoom();
        flowInstance.setCenter(targetNode.position.x + 140, targetNode.position.y + 72, {
          duration: 460,
          zoom: Math.max(currentZoom, 1.08),
        });
      }

      setPendingNodeFocus(null);
      return;
    }

    const graphIsIdle = !graphQuery.isFetching && !graphQuery.isRefetching;
    if (!graphIsIdle) {
      return;
    }

    if (!pendingNodeFocus.expandedDepthOnce) {
      setPendingNodeFocus((current) =>
        current ? { ...current, expandedDepthOnce: true } : current
      );
      setDepth((current) => current + 1);
      return;
    }

    setPendingNodeFocus(null);
  }, [flowNodes, graphQuery.isFetching, graphQuery.isRefetching, pendingNodeFocus]);

  useEffect(() => {
    setReplyContent("");
    replyMutation.reset();
  }, [selectedNodeId]);

  if (!rootId) {
    return (
      <AppShell>
        <GlassCard className="mx-auto mt-8 max-w-2xl">
          <AeroToast message="Invalid root id" variant="error" />
        </GlassCard>
      </AppShell>
    );
  }

  const graphError = (graphQuery.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;
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
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="aero-heading text-3xl font-black">Conversation Graph</h1>
          <p className="aero-subtitle text-sm">
            Root: {rootId} · depth {depth} · limit {GRAPH_LIMIT} · radial layers by likes
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            onInit={(instance) => {
              reactFlowRef.current = instance;
            }}
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

            <div className="my-3 border-t border-white/40" />

            <div>
              <div className="mb-2 flex items-center gap-2">
                <AeroIconBadge className="h-5 w-5" tone="cyan">
                  <Reply aria-hidden="true" size={11} />
                </AeroIconBadge>
                <p className="text-xs font-black uppercase tracking-[0.06em] text-sky-900/85">Reply in graph</p>
              </div>

              <form
                className="space-y-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!selectedNode || !canSubmitReply) {
                    return;
                  }
                  replyMutation.mutate({ postId: selectedNode.id, content: trimmedReply });
                }}
              >
                <label className="sr-only" htmlFor="graph-reply-content">
                  Reply content
                </label>
                <textarea
                  id="graph-reply-content"
                  className="aero-input min-h-[110px] resize-y"
                  maxLength={500}
                  onChange={(event) => setReplyContent(event.currentTarget.value)}
                  placeholder="Write a reply to this node..."
                  value={replyContent}
                />

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-sky-900/75">{replyContent.length}/500</span>
                  <GelButton
                    aria-label="Reply to selected node"
                    className="px-3 py-1.5 text-[11px]"
                    disabled={!canSubmitReply || replyMutation.isPending}
                    type="submit"
                  >
                    {replyMutation.isPending ? (
                      <LoaderCircle aria-hidden="true" className="animate-spin" size={12} />
                    ) : (
                      <AeroIconBadge className="h-4 w-4" tone="cyan">
                        <SendHorizontal aria-hidden="true" size={9} />
                      </AeroIconBadge>
                    )}
                    Reply
                  </GelButton>
                </div>
              </form>
            </div>

            {replyMutation.isError ? (
              <div className="mt-3">
                <AeroToast message={replyError ?? "Unable to reply from graph"} variant="error" />
              </div>
            ) : null}
            {replyMutation.isSuccess ? (
              <div className="mt-3">
                <AeroToast message="Reply sent from graph" variant="success" />
              </div>
            ) : null}
          </aside>
        ) : null}
      </GlassCard>
    </AppShell>
  );
}
