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
  topicAnchors: Map<string, { x: number, y: number, nextPlacementIndex: number }>;
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
  const world: FeedWorld = {
    nodesById: new Map(),
    occupiedCells: new Map(),
    topicAnchors: new Map(),
    nextPlacementIndex: 0,
    bounds: {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    },
  };

  // Reserve the center (0,0) for the Canvas Core visual indicator
  // A box slightly smaller than a standard node is enough to push the first posts to the sides
  occupyCells(world, 0, 0, 180, 180);

  return world;
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

function rebuildWorldBounds(world: FeedWorld) {
  if (world.nodesById.size === 0) {
    world.bounds.minX = 0;
    world.bounds.maxX = 0;
    world.bounds.minY = 0;
    world.bounds.maxY = 0;
    return;
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of world.nodesById.values()) {
    const left = node.x - FEED_NODE_OCCUPANCY_WIDTH / 2;
    const right = node.x + FEED_NODE_OCCUPANCY_WIDTH / 2;
    const top = node.y - FEED_NODE_OCCUPANCY_HEIGHT / 2;
    const bottom = node.y + FEED_NODE_OCCUPANCY_HEIGHT / 2;

    minX = Math.min(minX, left);
    maxX = Math.max(maxX, right);
    minY = Math.min(minY, top);
    maxY = Math.max(maxY, bottom);
  }

  world.bounds.minX = minX;
  world.bounds.maxX = maxX;
  world.bounds.minY = minY;
  world.bounds.maxY = maxY;
}

function rebuildOccupiedCells(world: FeedWorld) {
  world.occupiedCells.clear();
  for (const node of world.nodesById.values()) {
    occupyCells(
      world,
      node.x,
      node.y,
      FEED_NODE_OCCUPANCY_WIDTH,
      FEED_NODE_OCCUPANCY_HEIGHT
    );
  }
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

function createNodeAtTarget(
  world: FeedWorld,
  post: PostResponse,
  targetX: number,
  targetY: number,
  preferExactTarget: boolean
) {
  const existing = world.nodesById.get(post.id);
  if (existing) {
    return existing;
  }

  const index = world.nextPlacementIndex;
  world.nextPlacementIndex += 1;

  const placement = preferExactTarget
    ? { x: targetX, y: targetY }
    : findPlacement(
      world,
      targetX,
      targetY,
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

export function placeNodeInWorldAtTarget(world: FeedWorld, post: PostResponse, targetX: number, targetY: number) {
  return createNodeAtTarget(world, post, targetX, targetY, true);
}

export function placeNodeInWorld(world: FeedWorld, post: PostResponse) {
  const existing = world.nodesById.get(post.id);
  if (existing) {
    return existing;
  }

  const keywords = (post.topicKeywords && post.topicKeywords.length > 0)
    ? post.topicKeywords.map(k => k.toLowerCase())
    : ["general"];

  // 1. Try to find if any of the post's keywords already have an anchor
  let anchor: { x: number; y: number; nextPlacementIndex: number } | undefined;
  let anchorFoundBy = keywords[0];

  for (const keyword of keywords) {
    if (world.topicAnchors.has(keyword)) {
      anchor = world.topicAnchors.get(keyword);
      anchorFoundBy = keyword;
      break;
    }
  }

  // 2. If no existing anchor matches, create a new one using the first keyword
  if (!anchor) {
    const index = world.nextPlacementIndex;
    world.nextPlacementIndex += 1;

    // Spread main anchors heavily apart to allow sub-clusters to grow massively without colliding
    const ANCHOR_RADIUS = BASE_RADIUS * 4.2;
    const angle = index * GOLDEN_ANGLE;
    const radius = ANCHOR_RADIUS * Math.sqrt(index + 1);

    const seed = hashString(anchorFoundBy);
    const jitterX = (toUnit(seed) - 0.5) * JITTER * 3;
    const jitterY = (toUnit(hashString(`${anchorFoundBy}:${index}`)) - 0.5) * JITTER * 3;

    anchor = {
      x: (Math.cos(angle) * radius) + jitterX,
      y: (Math.sin(angle) * radius) + jitterY,
      nextPlacementIndex: 0
    };
  }

  // 3. Link ALL keywords of this post to the chosen anchor.
  // This allows the "island" to learn new related keywords progressively!
  for (const keyword of keywords) {
    if (!world.topicAnchors.has(keyword)) {
      world.topicAnchors.set(keyword, anchor);
    }
  }

  const subIndex = anchor.nextPlacementIndex;
  anchor.nextPlacementIndex += 1;

  // Tighter radius for posts within the same topic cluster
  const SUB_RADIUS = BASE_RADIUS * 0.15; // Drastically reduced for tighter visual packing
  const subAngle = subIndex * GOLDEN_ANGLE;
  const subRadius = SUB_RADIUS * Math.sqrt(subIndex + 1);

  const seed = hashString(post.id);
  const jitterX = (toUnit(seed) - 0.5) * (JITTER * 0.2); // Reduced random spreading
  const jitterY = (toUnit(hashString(`${post.id}:${subIndex}`)) - 0.5) * (JITTER * 0.2);

  const desiredX = anchor.x + (Math.cos(subAngle) * subRadius) + jitterX;
  const desiredY = anchor.y + (Math.sin(subAngle) * subRadius) + jitterY;

  return createNodeAtTarget(world, post, desiredX, desiredY, false);
}

export function moveNodeInWorld(world: FeedWorld, nodeId: string, targetX: number, targetY: number) {
  const node = world.nodesById.get(nodeId);
  if (!node) {
    return null;
  }

  node.x = targetX;
  node.y = targetY;
  rebuildOccupiedCells(world);
  rebuildWorldBounds(world);
  return node;
}
