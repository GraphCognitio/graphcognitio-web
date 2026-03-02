import type { ConversationNodeResponse } from "../types/graphTypes";
import { buildConversationLayout } from "./layoutConversation";

type Position = {
  x: number;
  y: number;
};

const RELATED_RING_RADIUS = 1080;
const RELATED_RING_RADIUS_COMPACT = 760;
const FALLBACK_RING_RADIUS = 1340;

function sortByEngagement(
  nodes: ConversationNodeResponse[],
  likeCountByNodeId: Record<string, number>
) {
  return [...nodes].sort((nodeA, nodeB) => {
    const likesA = likeCountByNodeId[nodeA.id] ?? 0;
    const likesB = likeCountByNodeId[nodeB.id] ?? 0;
    if (likesA !== likesB) {
      return likesB - likesA;
    }

    if (nodeA.replyCount !== nodeB.replyCount) {
      return nodeB.replyCount - nodeA.replyCount;
    }

    if (nodeA.createdAt !== nodeB.createdAt) {
      return nodeA.createdAt < nodeB.createdAt ? 1 : -1;
    }

    return nodeA.id.localeCompare(nodeB.id);
  });
}

export function buildTopicLayout(
  nodes: ConversationNodeResponse[],
  likeCountByNodeId: Record<string, number>,
  focusRootId: string
) {
  const positions = new Map<string, Position>();
  if (nodes.length === 0) {
    return positions;
  }

  const focusRoot =
    nodes.find((node) => node.id === focusRootId) ??
    nodes.find((node) => node.parentId === null) ??
    nodes[0];

  const primaryConversationNodes = nodes.filter(
    (node) => node.id === focusRoot.id || node.rootId === focusRoot.rootId
  );
  const relatedRoots = sortByEngagement(
    nodes.filter((node) => node.parentId === null && node.id !== focusRoot.id),
    likeCountByNodeId
  );

  buildConversationLayout(primaryConversationNodes, likeCountByNodeId).forEach((position, nodeId) => {
    positions.set(nodeId, position);
  });

  const relatedRingRadius =
    primaryConversationNodes.length > 2 ? RELATED_RING_RADIUS : RELATED_RING_RADIUS_COMPACT;
  const relatedStep = relatedRoots.length > 0 ? (2 * Math.PI) / relatedRoots.length : 0;

  relatedRoots.forEach((node, index) => {
    const angle = -Math.PI / 2 + index * relatedStep;
    positions.set(node.id, {
      x: Math.cos(angle) * relatedRingRadius,
      y: Math.sin(angle) * relatedRingRadius,
    });
  });

  const unplacedNodes = nodes.filter((node) => !positions.has(node.id));
  if (unplacedNodes.length > 0) {
    const fallbackStep = (2 * Math.PI) / unplacedNodes.length;
    unplacedNodes.forEach((node, index) => {
      const angle = -Math.PI / 2 + index * fallbackStep;
      positions.set(node.id, {
        x: Math.cos(angle) * FALLBACK_RING_RADIUS,
        y: Math.sin(angle) * FALLBACK_RING_RADIUS,
      });
    });
  }

  return positions;
}
