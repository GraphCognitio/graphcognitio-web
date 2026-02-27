import type { ConversationNodeResponse } from "../types/graphTypes";

type Position = {
  x: number;
  y: number;
};

const BASE_RING_RADIUS = 380;
const RING_GAP = 250;
const INITIAL_RING_CAPACITY = 8;
const RING_CAPACITY_STEP = 6;

export function buildConversationLayout(
  nodes: ConversationNodeResponse[],
  likeCountByNodeId: Record<string, number>
) {
  const positions = new Map<string, Position>();
  if (nodes.length === 0) {
    return positions;
  }

  const rootNode = nodes.find((node) => node.parentId === null) ?? nodes[0];
  positions.set(rootNode.id, { x: 0, y: 0 });

  const replies = nodes.filter((node) => node.id !== rootNode.id);
  const sortedReplies = [...replies].sort((nodeA, nodeB) => {
    const likesA = likeCountByNodeId[nodeA.id] ?? 0;
    const likesB = likeCountByNodeId[nodeB.id] ?? 0;
    if (likesA !== likesB) {
      return likesB - likesA;
    }

    if (nodeA.replyCount !== nodeB.replyCount) {
      return nodeB.replyCount - nodeA.replyCount;
    }

    return nodeA.createdAt < nodeB.createdAt ? 1 : -1;
  });

  let ringIndex = 0;
  let cursor = 0;
  let ringCapacity = INITIAL_RING_CAPACITY;

  while (cursor < sortedReplies.length) {
    const ringNodes = sortedReplies.slice(cursor, cursor + ringCapacity);
    const radius = BASE_RING_RADIUS + ringIndex * RING_GAP;
    const angleStep = (2 * Math.PI) / ringNodes.length;
    const angleOffset = ringIndex % 2 === 0 ? -Math.PI / 2 : -Math.PI / 2 + angleStep / 2;

    ringNodes.forEach((node, index) => {
      const angle = angleOffset + index * angleStep;
      positions.set(node.id, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    });

    cursor += ringNodes.length;
    ringIndex += 1;
    ringCapacity += RING_CAPACITY_STEP;
  }

  return positions;
}
