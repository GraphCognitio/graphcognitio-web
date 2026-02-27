import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle, LoaderCircle, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getFeedPage } from "../../../api/feedApi";
import { AeroInput } from "../../../components/ui/AeroInput";
import { AeroToast } from "../../../components/ui/AeroToast";
import { GelButton } from "../../../components/ui/GelButton";
import { createFeedWorld, placeNodeInWorld } from "../canvas/worldPlacement";
import { FeedInspectorPanel } from "./FeedInspectorPanel";
import { FeedNodeCard } from "./FeedNodeCard";
import type { PostResponse } from "../types/feedTypes";

type CameraState = {
  x: number;
  y: number;
  zoom: number;
  targetX: number;
  targetY: number;
  targetZoom: number;
  width: number;
  height: number;
  dragActive: boolean;
  dragLastX: number;
  dragLastY: number;
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const FEED_LIMIT = 20;
const WORLD_HALF_EXTENT = 12_000;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest("a,button,input,textarea,select,label"));
}

function cameraToViewport(camera: CameraState) {
  const halfWidth = camera.width / (2 * camera.zoom);
  const halfHeight = camera.height / (2 * camera.zoom);

  return {
    left: camera.x - halfWidth,
    right: camera.x + halfWidth,
    top: camera.y - halfHeight,
    bottom: camera.y + halfHeight,
  };
}

function clampToWorld(value: number) {
  return clamp(value, -WORLD_HALF_EXTENT, WORLD_HALF_EXTENT);
}

export function FeedCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const worldLayerRef = useRef<HTMLDivElement | null>(null);

  const worldRef = useRef(createFeedWorld());
  const cameraRef = useRef<CameraState>({
    x: 0,
    y: 0,
    zoom: 1,
    targetX: 0,
    targetY: 0,
    targetZoom: 1,
    width: 0,
    height: 0,
    dragActive: false,
    dragLastX: 0,
    dragLastY: 0,
  });

  const hasNextPageRef = useRef(false);
  const isFetchingNextPageRef = useRef(false);
  const fetchNextPageRef = useRef<(() => Promise<unknown>) | null>(null);
  const lastLoadAttemptRef = useRef(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [worldVersion, setWorldVersion] = useState(0);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const feedQuery = useInfiniteQuery({
    queryKey: ["feed", "root-posts"],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => getFeedPage({ cursor: pageParam, limit: FEED_LIMIT }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const dedupedPosts = useMemo<PostResponse[]>(() => {
    if (!feedQuery.data) {
      return [];
    }

    const uniquePosts = new Map<string, PostResponse>();
    for (const page of feedQuery.data.pages) {
      for (const post of page.items) {
        if (!uniquePosts.has(post.id)) {
          uniquePosts.set(post.id, post);
        }
      }
    }

    return Array.from(uniquePosts.values());
  }, [feedQuery.data]);

  useEffect(() => {
    hasNextPageRef.current = Boolean(feedQuery.hasNextPage);
  }, [feedQuery.hasNextPage]);

  useEffect(() => {
    isFetchingNextPageRef.current = feedQuery.isFetchingNextPage;
  }, [feedQuery.isFetchingNextPage]);

  useEffect(() => {
    fetchNextPageRef.current = async () => {
      await feedQuery.fetchNextPage();
    };
  }, [feedQuery.fetchNextPage]);

  useEffect(() => {
    let nodesAdded = false;
    for (const post of dedupedPosts) {
      if (!worldRef.current.nodesById.has(post.id)) {
        placeNodeInWorld(worldRef.current, post);
        nodesAdded = true;
      }
    }

    if (nodesAdded) {
      setWorldVersion((current) => current + 1);
    }
  }, [dedupedPosts]);

  const allNodes = useMemo(() => {
    return Array.from(worldRef.current.nodesById.values()).sort((nodeA, nodeB) => nodeA.index - nodeB.index);
  }, [worldVersion]);

  const filteredVisibleNodes = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) {
      return allNodes;
    }

    return allNodes.filter((node) => {
      return (
        node.post.authorName.toLowerCase().includes(needle) ||
        node.post.content.toLowerCase().includes(needle)
      );
    });
  }, [allNodes, searchTerm]);

  const activeNode = activeNodeId ? worldRef.current.nodesById.get(activeNodeId) ?? null : null;

  useEffect(() => {
    const container = containerRef.current;
    const worldLayer = worldLayerRef.current;
    if (!container || !worldLayer) {
      return;
    }

    let animationFrameId = 0;
    let lastEdgeCheckSample = 0;

    const updateCameraDimensions = () => {
      const rect = container.getBoundingClientRect();
      cameraRef.current.width = rect.width;
      cameraRef.current.height = rect.height;
    };

    const updateLoadMoreByEdge = (now: number) => {
      if (now - lastEdgeCheckSample < 120) {
        return;
      }

      const camera = cameraRef.current;
      if (!camera.width || !camera.height) {
        return;
      }

      lastEdgeCheckSample = now;
      const viewport = cameraToViewport(camera);

      const bounds = worldRef.current.bounds;
      const threshold = Math.max(220, (camera.width / camera.zoom) * 0.22);
      const nearEdge =
        viewport.right >= bounds.maxX - threshold ||
        viewport.left <= bounds.minX + threshold ||
        viewport.bottom >= bounds.maxY - threshold ||
        viewport.top <= bounds.minY + threshold;

      const enoughDelay = Date.now() - lastLoadAttemptRef.current >= 650;
      if (
        nearEdge &&
        enoughDelay &&
        hasNextPageRef.current &&
        !isFetchingNextPageRef.current &&
        fetchNextPageRef.current
      ) {
        lastLoadAttemptRef.current = Date.now();
        void fetchNextPageRef.current();
      }
    };

    const frame = (timestamp: number) => {
      const camera = cameraRef.current;

      camera.targetX = clampToWorld(camera.targetX);
      camera.targetY = clampToWorld(camera.targetY);
      camera.x = clampToWorld(camera.targetX);
      camera.y = clampToWorld(camera.targetY);
      camera.zoom += (camera.targetZoom - camera.zoom) * 0.2;

      if (Math.abs(camera.targetZoom - camera.zoom) < 0.001) {
        camera.zoom = camera.targetZoom;
      }

      const translateX = camera.width / 2 - camera.x * camera.zoom;
      const translateY = camera.height / 2 - camera.y * camera.zoom;

      worldLayer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${camera.zoom})`;

      updateLoadMoreByEdge(timestamp);
      animationFrameId = window.requestAnimationFrame(frame);
    };

    updateCameraDimensions();
    window.addEventListener("resize", updateCameraDimensions);
    animationFrameId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateCameraDimensions);
    };
  }, [worldVersion]);

  return (
    <section className="aero-glass relative min-h-[66vh] overflow-hidden p-0">
      <div
        ref={containerRef}
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={(event) => {
          if (event.button !== 0) {
            return;
          }
          if (isInteractiveTarget(event.target)) {
            return;
          }

          event.currentTarget.setPointerCapture(event.pointerId);
          cameraRef.current.dragActive = true;
          cameraRef.current.dragLastX = event.clientX;
          cameraRef.current.dragLastY = event.clientY;
        }}
        onPointerMove={(event) => {
          const camera = cameraRef.current;
          if (!camera.dragActive) {
            return;
          }

          const deltaX = event.clientX - camera.dragLastX;
          const deltaY = event.clientY - camera.dragLastY;
          camera.dragLastX = event.clientX;
          camera.dragLastY = event.clientY;

          camera.targetX -= deltaX / camera.targetZoom;
          camera.targetY -= deltaY / camera.targetZoom;
          camera.targetX = clampToWorld(camera.targetX);
          camera.targetY = clampToWorld(camera.targetY);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          cameraRef.current.dragActive = false;
        }}
        onPointerCancel={() => {
          cameraRef.current.dragActive = false;
        }}
        onWheel={(event) => {
          event.preventDefault();

          const camera = cameraRef.current;
          const rect = event.currentTarget.getBoundingClientRect();
          const cursorX = event.clientX - rect.left;
          const cursorY = event.clientY - rect.top;

          const scaleFactor = Math.exp(-event.deltaY * 0.0014);
          const nextZoom = clamp(camera.targetZoom * scaleFactor, MIN_ZOOM, MAX_ZOOM);

          const worldXBefore = (cursorX - camera.width / 2) / camera.targetZoom + camera.targetX;
          const worldYBefore = (cursorY - camera.height / 2) / camera.targetZoom + camera.targetY;

          camera.targetZoom = nextZoom;
          camera.targetX = worldXBefore - (cursorX - camera.width / 2) / nextZoom;
          camera.targetY = worldYBefore - (cursorY - camera.height / 2) / nextZoom;
          camera.targetX = clampToWorld(camera.targetX);
          camera.targetY = clampToWorld(camera.targetY);
        }}
      >
        <div ref={worldLayerRef} className="absolute left-0 top-0 will-change-transform" style={{ transformOrigin: "0 0" }}>
          {filteredVisibleNodes.map((node) => (
            <FeedNodeCard key={node.id} node={node} onInspect={setActiveNodeId} />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute left-4 top-4 z-20 flex w-[min(580px,calc(100%-2rem))] flex-col gap-3">
        <div className="aero-glass pointer-events-auto flex flex-wrap items-end gap-3 p-3">
          <div className="min-w-[200px] flex-1">
            <AeroInput
              id="feed-search"
              label="Search visible cards"
              onChange={(event) => setSearchTerm(event.currentTarget.value)}
              placeholder="Author or content"
              value={searchTerm}
            />
          </div>

          <div className="flex items-center gap-2 pb-1">
            <GelButton
              aria-label="Zoom out"
              onClick={() => {
                cameraRef.current.targetZoom = clamp(cameraRef.current.targetZoom - 0.15, MIN_ZOOM, MAX_ZOOM);
              }}
              type="button"
            >
              <ZoomOut aria-hidden="true" size={14} />
            </GelButton>
            <GelButton
              aria-label="Zoom in"
              onClick={() => {
                cameraRef.current.targetZoom = clamp(cameraRef.current.targetZoom + 0.15, MIN_ZOOM, MAX_ZOOM);
              }}
              type="button"
            >
              <ZoomIn aria-hidden="true" size={14} />
            </GelButton>
          </div>
        </div>

        <div className="aero-glass pointer-events-auto inline-flex w-fit items-center gap-2 px-3 py-2 text-xs font-semibold text-sky-900/90">
          <span>Loaded nodes: {worldRef.current.nodesById.size}</span>
          <span>Visible: {filteredVisibleNodes.length}</span>
          {feedQuery.hasNextPage ? <span>More available</span> : <span>End reached</span>}
        </div>

        {feedQuery.isError ? (
          <div className="pointer-events-auto max-w-md">
            <AeroToast message="Unable to load feed" variant="error" />
          </div>
        ) : null}
      </div>

      <FeedInspectorPanel node={activeNode} onClose={() => setActiveNodeId(null)} />

      {feedQuery.isLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-sky-900/12 backdrop-blur-[2px]">
          <div className="aero-glass flex items-center gap-2 px-4 py-3 text-sm font-semibold text-sky-900">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />
            Loading feed
          </div>
        </div>
      ) : null}

      {feedQuery.isFetchingNextPage ? (
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
          <div className="aero-glass flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-sky-900">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={13} />
            Fetching more nodes
          </div>
        </div>
      ) : null}

      {feedQuery.data?.pages.length === 0 && !feedQuery.isLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="aero-glass flex items-center gap-2 px-4 py-3 text-sm font-semibold text-sky-900">
            <AlertCircle aria-hidden="true" size={15} />
            No posts available
          </div>
        </div>
      ) : null}
    </section>
  );
}
