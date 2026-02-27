import type { PostResponse } from "../types/feedTypes";

export const FEED_NODE_WIDTH = 320;
export const FEED_NODE_HEIGHT = 216;
export const FEED_NODE_MAX_GROWTH = 120;
export const FEED_NODE_MAX_HEIGHT_GROWTH = Math.round(FEED_NODE_MAX_GROWTH * 0.62);
export const FEED_NODE_OCCUPANCY_WIDTH = FEED_NODE_WIDTH + FEED_NODE_MAX_GROWTH;
export const FEED_NODE_OCCUPANCY_HEIGHT = FEED_NODE_HEIGHT + FEED_NODE_MAX_HEIGHT_GROWTH;

const CELL_SIZE = 72;
const GOLDEN_ANGLE = 2.399963229728653;
const BASE_RADIUS = 210;
const JITTER = 86;

type WorldBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type FeedWorldNode = {
  id: string;
  post: PostResponse;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FeedWorld = {
  nodesById: Map<string, FeedWorldNode>;
  occupiedCells: Map<string, true>;
  nextPlacementIndex: number;
  bounds: WorldBounds;
};

export function resolveFeedNodeDimensions(baseWidth: number, baseHeight: number, replyCount: number) {
  const normalizedReplies = Math.max(0, replyCount);
  const growth = Math.min(FEED_NODE_MAX_GROWTH, Math.round(Math.sqrt(normalizedReplies) * 14));
  return {
    width: baseWidth + growth,
    height: baseHeight + Math.round(growth * 0.62),
  };
}

export function createFeedWorld(): FeedWorld {
  return {
    nodesById: new Map(),
    occupiedCells: new Map(),
    nextPlacementIndex: 0,
    bounds: {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
  };
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function toUnit(hash: number) {
  return (hash % 10_000) / 10_000;
}

function spiralTarget(index: number) {
  const angle = index * GOLDEN_ANGLE;
  const radius = BASE_RADIUS * Math.sqrt(index + 1);

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

function boxToCells(x: number, y: number, width: number, height: number) {
  const left = Math.floor((x - width / 2) / CELL_SIZE);
  const right = Math.floor((x + width / 2) / CELL_SIZE);
  const top = Math.floor((y - height / 2) / CELL_SIZE);
  const bottom = Math.floor((y + height / 2) / CELL_SIZE);

  return { left, right, top, bottom };
}

function cellKey(x: number, y: number) {
  return `${x}:${y}`;
}

function canPlace(world: FeedWorld, x: number, y: number, width: number, height: number) {
  const cells = boxToCells(x, y, width, height);
  for (let row = cells.top; row <= cells.bottom; row += 1) {
    for (let col = cells.left; col <= cells.right; col += 1) {
      if (world.occupiedCells.has(cellKey(col, row))) {
        return false;
      }
    }
  }
  return true;
}

function occupyCells(world: FeedWorld, x: number, y: number, width: number, height: number) {
  const cells = boxToCells(x, y, width, height);
  for (let row = cells.top; row <= cells.bottom; row += 1) {
    for (let col = cells.left; col <= cells.right; col += 1) {
      world.occupiedCells.set(cellKey(col, row), true);
    }
  }
}

function updateBounds(world: FeedWorld, x: number, y: number, width: number, height: number) {
  const left = x - width / 2;
  const right = x + width / 2;
  const top = y - height / 2;
  const bottom = y + height / 2;

  if (world.nodesById.size === 0) {
    world.bounds.minX = left;
    world.bounds.maxX = right;
    world.bounds.minY = top;
    world.bounds.maxY = bottom;
    return;
  }

  world.bounds.minX = Math.min(world.bounds.minX, left);
  world.bounds.maxX = Math.max(world.bounds.maxX, right);
  world.bounds.minY = Math.min(world.bounds.minY, top);
  world.bounds.maxY = Math.max(world.bounds.maxY, bottom);
}

function perimeterOffsets(ring: number) {
  if (ring === 0) {
    return [[0, 0]] as Array<[number, number]>;
  }

  const offsets: Array<[number, number]> = [];
  for (let x = -ring; x <= ring; x += 1) {
    offsets.push([x, -ring]);
    offsets.push([x, ring]);
  }
  for (let y = -ring + 1; y <= ring - 1; y += 1) {
    offsets.push([-ring, y]);
    offsets.push([ring, y]);
  }
  return offsets;
}

function findPlacement(world: FeedWorld, targetX: number, targetY: number, width: number, height: number) {
  const searchStep = CELL_SIZE * 0.95;

  for (let ring = 0; ring < 26; ring += 1) {
    const offsets = perimeterOffsets(ring);

    for (const [dx, dy] of offsets) {
      const candidateX = targetX + dx * searchStep;
      const candidateY = targetY + dy * searchStep;
      if (canPlace(world, candidateX, candidateY, width, height)) {
        return { x: candidateX, y: candidateY };
      }
    }
  }

  return { x: targetX, y: targetY };
}

export function placeNodeInWorld(world: FeedWorld, post: PostResponse) {
  const existing = world.nodesById.get(post.id);
  if (existing) {
    return existing;
  }

  const index = world.nextPlacementIndex;
  world.nextPlacementIndex += 1;

  const seed = hashString(post.id);
  const target = spiralTarget(index);
  const jitterX = (toUnit(seed) - 0.5) * JITTER;
  const jitterY = (toUnit(hashString(`${post.id}:${index}`)) - 0.5) * JITTER;

  const desiredX = target.x + jitterX;
  const desiredY = target.y + jitterY;

  const placement = findPlacement(
    world,
    desiredX,
    desiredY,
    FEED_NODE_OCCUPANCY_WIDTH,
    FEED_NODE_OCCUPANCY_HEIGHT
  );

  occupyCells(
    world,
    placement.x,
    placement.y,
    FEED_NODE_OCCUPANCY_WIDTH,
    FEED_NODE_OCCUPANCY_HEIGHT
  );
  updateBounds(
    world,
    placement.x,
    placement.y,
    FEED_NODE_OCCUPANCY_WIDTH,
    FEED_NODE_OCCUPANCY_HEIGHT
  );

  const node: FeedWorldNode = {
    id: post.id,
    post,
    index,
    x: placement.x,
    y: placement.y,
    width: FEED_NODE_WIDTH,
    height: FEED_NODE_HEIGHT,
  };

  world.nodesById.set(post.id, node);
  return node;
}
