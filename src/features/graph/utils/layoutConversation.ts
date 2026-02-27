import type { ConversationNodeResponse } from "../types/graphTypes";

type Position = {
  x: number;
  y: number;
};

const LEVEL_BASE_RADIUS = 360;
const LEVEL_GAP = 240;
const MIN_SUBTREE_ANGLE = Math.PI / 10;

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

  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const childrenByParentId = new Map<string, ConversationNodeResponse[]>();

  for (const node of nodes) {
    if (node.id === rootNode.id) {
      continue;
    }

    const resolvedParentId =
      node.parentId && nodeById.has(node.parentId) ? node.parentId : rootNode.id;
    const siblings = childrenByParentId.get(resolvedParentId) ?? [];
    siblings.push(node);
    childrenByParentId.set(resolvedParentId, siblings);
  }

  const placedNodeIds = new Set<string>([rootNode.id]);

  const placeChildren = (parentId: string, parentDepth: number, parentAngle: number, subtreeAngleWidth: number) => {
    const children = sortByEngagement(childrenByParentId.get(parentId) ?? [], likeCountByNodeId);
    if (children.length === 0) {
      return;
    }

    const depth = parentDepth + 1;
    const radius = LEVEL_BASE_RADIUS + (depth - 1) * LEVEL_GAP;
    const spread = Math.max(MIN_SUBTREE_ANGLE, Math.min(Math.PI * 1.65, subtreeAngleWidth * 0.92));
    const startAngle = parentAngle - spread / 2;
    const angleStep = children.length === 1 ? 0 : spread / (children.length - 1);

    children.forEach((childNode, index) => {
      const childAngle = children.length === 1 ? parentAngle : startAngle + index * angleStep;
      positions.set(childNode.id, {
        x: Math.cos(childAngle) * radius,
        y: Math.sin(childAngle) * radius,
      });
      placedNodeIds.add(childNode.id);

      const nextSubtreeAngleWidth = Math.max(
        MIN_SUBTREE_ANGLE,
        Math.min(Math.PI * 1.2, spread / Math.max(children.length, 1))
      );
      placeChildren(childNode.id, depth, childAngle, nextSubtreeAngleWidth);
    });
  };

  const rootChildren = sortByEngagement(childrenByParentId.get(rootNode.id) ?? [], likeCountByNodeId);
  if (rootChildren.length === 1) {
    const angle = -Math.PI / 2;
    positions.set(rootChildren[0].id, {
      x: Math.cos(angle) * LEVEL_BASE_RADIUS,
      y: Math.sin(angle) * LEVEL_BASE_RADIUS,
    });
    placedNodeIds.add(rootChildren[0].id);
    placeChildren(rootChildren[0].id, 1, angle, Math.PI * 0.9);
  } else if (rootChildren.length > 1) {
    const rootAngleStep = (2 * Math.PI) / rootChildren.length;

    rootChildren.forEach((childNode, index) => {
      const angle = -Math.PI / 2 + index * rootAngleStep;
      positions.set(childNode.id, {
        x: Math.cos(angle) * LEVEL_BASE_RADIUS,
        y: Math.sin(angle) * LEVEL_BASE_RADIUS,
      });
      placedNodeIds.add(childNode.id);
      placeChildren(childNode.id, 1, angle, Math.max(MIN_SUBTREE_ANGLE, rootAngleStep * 0.85));
    });
  }

  const unplaced = nodes.filter((node) => !placedNodeIds.has(node.id));
  if (unplaced.length > 0) {
    const fallbackRadius = LEVEL_BASE_RADIUS + LEVEL_GAP * 4;
    const fallbackStep = (2 * Math.PI) / unplaced.length;
    unplaced.forEach((node, index) => {
      const angle = -Math.PI / 2 + index * fallbackStep;
      positions.set(node.id, {
        x: Math.cos(angle) * fallbackRadius,
        y: Math.sin(angle) * fallbackRadius,
      });
    });
  }

  return positions;
}
