import type { ConversationNodeResponse } from "../types/graphTypes";

type Position = {
  x: number;
  y: number;
};

const LEVEL_X_SPACING = 340;
const LEVEL_Y_SPACING = 210;

export function buildConversationLayout(nodes: ConversationNodeResponse[]) {
  const positions = new Map<string, Position>();
  if (nodes.length === 0) {
    return positions;
  }

  const byParent = new Map<string, string[]>();
  for (const node of nodes) {
    if (!node.parentId) {
      continue;
    }
    const children = byParent.get(node.parentId) ?? [];
    children.push(node.id);
    byParent.set(node.parentId, children);
  }

  const roots = nodes.filter((node) => node.parentId === null).map((node) => node.id);
  const queue = roots.length > 0 ? [...roots] : [nodes[0].id];
  const visited = new Set<string>(queue);
  const levels: string[][] = [];

  while (queue.length > 0) {
    const level = [...queue];
    queue.length = 0;
    levels.push(level);

    for (const nodeId of level) {
      const children = byParent.get(nodeId) ?? [];
      for (const childId of children) {
        if (visited.has(childId)) {
          continue;
        }
        visited.add(childId);
        queue.push(childId);
      }
    }
  }

  const leftovers = nodes
    .map((node) => node.id)
    .filter((nodeId) => !visited.has(nodeId));

  for (const nodeId of leftovers) {
    levels.push([nodeId]);
    visited.add(nodeId);
  }

  levels.forEach((level, depth) => {
    const totalWidth = (level.length - 1) * LEVEL_X_SPACING;
    const startX = -totalWidth / 2;

    level.forEach((nodeId, index) => {
      positions.set(nodeId, {
        x: startX + index * LEVEL_X_SPACING,
        y: depth * LEVEL_Y_SPACING,
      });
    });
  });

  return positions;
}
