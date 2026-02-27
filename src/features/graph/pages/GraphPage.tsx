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
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { ArrowLeft, LoaderCircle, Network, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getConversationGraph } from "../../../api/graphApi";
import { AeroScene } from "../../../components/layout/AeroScene";
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

const INITIAL_DEPTH = 2;
const GRAPH_LIMIT = 120;

const nodeTypes: NodeTypes = {
  conversation: ConversationFlowNode,
};

export function GraphPage() {
  const navigate = useNavigate();
  const { rootId } = useParams();
  const [depth, setDepth] = useState(INITIAL_DEPTH);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const graphQuery = useQuery({
    queryKey: ["graph", rootId, depth, GRAPH_LIMIT],
    queryFn: () => getConversationGraph({ rootId: rootId!, depth, limit: GRAPH_LIMIT }),
    enabled: Boolean(rootId),
  });

  const layout = useMemo(() => {
    return buildConversationLayout(graphQuery.data?.nodes ?? []);
  }, [graphQuery.data?.nodes]);

  const flowNodes = useMemo<Node<ConversationFlowNodeData>[]>(() => {
    const nodes = graphQuery.data?.nodes ?? [];

    return nodes.map((node) => {
      const position = layout.get(node.id) ?? { x: 0, y: 0 };
      return {
        id: node.id,
        type: "conversation",
        position,
        data: {
          authorName: node.authorName,
          contentPreview: node.contentPreview,
          createdAt: node.createdAt,
          replyCount: node.replyCount,
        },
      };
    });
  }, [graphQuery.data?.nodes, layout]);

  const flowEdges = useMemo<Edge[]>(() => {
    const edges = graphQuery.data?.edges ?? [];

    return edges.map((edge) => ({
      id: edge.id,
      source: edge.sourcePostId,
      target: edge.targetPostId,
      type: "smoothstep",
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#2ea6de",
      },
      style: {
        stroke: "#2ea6de",
        strokeWidth: 1.8,
        opacity: 0.9,
      },
    }));
  }, [graphQuery.data?.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const selectedNode: ConversationNodeResponse | null =
    graphQuery.data?.nodes.find((node) => node.id === selectedNodeId) ?? null;

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
            Root: {rootId} · depth {depth} · limit {GRAPH_LIMIT}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Go back"
            className="aero-focus-ring inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-xs font-semibold text-sky-900"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
                return;
              }
              navigate("/feed");
            }}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={12} />
            Back
          </button>
          <GelButton aria-label="Increase graph depth" onClick={() => setDepth((current) => current + 1)} type="button">
            <Plus aria-hidden="true" size={14} />
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

        <div className="h-[70vh] w-full">
          <ReactFlow
            fitView
            edges={edges}
            nodes={nodes}
            nodeTypes={nodeTypes}
            onEdgesChange={onEdgesChange}
            onNodesChange={onNodesChange}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            panOnDrag
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
                className="aero-focus-ring rounded-full border border-white/70 bg-white/45 px-3 py-1 text-xs font-bold text-sky-900"
                onClick={() => setSelectedNodeId(null)}
                type="button"
              >
                Close
              </button>
            </header>

            <p className="mb-1 text-sm font-bold text-sky-900">{selectedNode.authorName}</p>
            <p className="mb-3 text-sm leading-relaxed text-sky-950/92">{selectedNode.contentPreview}</p>

            <div className="flex flex-wrap items-center gap-2">
              <Link className="aero-gel aero-focus-ring inline-flex items-center gap-1 px-4 py-2 text-xs" to={`/post/${selectedNode.id}`}>
                Open post
              </Link>
              <button
                aria-label="Expand graph depth"
                className="aero-focus-ring inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/45 px-4 py-2 text-xs font-semibold text-sky-900"
                onClick={() => setDepth((current) => current + 1)}
                type="button"
              >
                <Network aria-hidden="true" size={12} />
                Expand
              </button>
            </div>
          </aside>
        ) : null}
      </GlassCard>
    </AeroScene>
  );
}
