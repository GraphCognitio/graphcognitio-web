import { describe, it, expect } from 'vitest';
import { createFeedWorld, placeNodeInWorld, FeedWorld } from './worldPlacement';
import { PostResponse } from '../types/feedTypes';

function createMockPost(id: string, topicKeywords: string[]): PostResponse {
    return {
        id,
        authorId: 'author1',
        authorName: 'Author',
        authorUsername: 'author',
        content: 'Mock content',
        createdAt: new Date().toISOString(),
        updatedAt: null,
        parentId: null,
        rootId: id,
        replyCount: 0,
        likeCount: 0,
        likedByMe: false,
        topicKeywords,
    };
}

describe('worldPlacement', () => {
    it('should cluster posts with the same topic together', () => {
        const world: FeedWorld = createFeedWorld();

        // Create 3 posts about AI
        const postAi1 = createMockPost('ai1', ['ai', 'machine learning']);
        const postAi2 = createMockPost('ai2', ['machine learning', 'deep learning']);
        const postAi3 = createMockPost('ai3', ['neural networks', 'ai']);

        // Create 3 posts about Baking
        const postBake1 = createMockPost('bake1', ['baking', 'bread']);
        const postBake2 = createMockPost('bake2', ['sourdough', 'baking']);
        const postBake3 = createMockPost('bake3', ['bread', 'yeast']);

        // Place them in the world
        const nodeAi1 = placeNodeInWorld(world, postAi1);
        const nodeBake1 = placeNodeInWorld(world, postBake1);
        const nodeAi2 = placeNodeInWorld(world, postAi2);
        const nodeBake2 = placeNodeInWorld(world, postBake2);
        const nodeAi3 = placeNodeInWorld(world, postAi3);
        const nodeBake3 = placeNodeInWorld(world, postBake3);

        // Calculate distance between two nodes
        const getDistance = (n1: any, n2: any) => {
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            return Math.sqrt(dx * dx + dy * dy);
        };

        // Calculate distances between AI posts
        const distAi1_Ai2 = getDistance(nodeAi1, nodeAi2);
        const distAi2_Ai3 = getDistance(nodeAi2, nodeAi3);
        const distAi1_Ai3 = getDistance(nodeAi1, nodeAi3);

        // Calculate distances between Baking posts
        const distBake1_Bake2 = getDistance(nodeBake1, nodeBake2);
        const distBake2_Bake3 = getDistance(nodeBake2, nodeBake3);
        const distBake1_Bake3 = getDistance(nodeBake1, nodeBake3);

        // Calculate distance between an AI post and a Baking post
        const distAi1_Bake1 = getDistance(nodeAi1, nodeBake1);

        // Assertions: 
        // 1. Posts in the same cluster should be relatively close to each other
        // Due to jitter and the spiral radius, let's say they should be within 1000 pixels
        const MAX_CLUSTER_DIST = 1000;
        expect(distAi1_Ai2).toBeLessThan(MAX_CLUSTER_DIST);
        expect(distAi2_Ai3).toBeLessThan(MAX_CLUSTER_DIST);
        expect(distAi1_Ai3).toBeLessThan(MAX_CLUSTER_DIST);

        expect(distBake1_Bake2).toBeLessThan(MAX_CLUSTER_DIST);
        expect(distBake2_Bake3).toBeLessThan(MAX_CLUSTER_DIST);
        expect(distBake1_Bake3).toBeLessThan(MAX_CLUSTER_DIST);

        // 2. Posts from different clusters should be significantly further apart
        // Main anchors are spaced heavily (BASE_RADIUS * 4.2), so distance should be substantial
        expect(distAi1_Bake1).toBeGreaterThan(MAX_CLUSTER_DIST * 1.5);

        // Bonus: Check that the anchors absorbed the shared keywords properly
        // Post Ai1 created it with 'ai'. Post Ai2 arrived with 'machine learning', which wasn't in the anchor originally.
        // If propagation works, the anchor now knows 'machine learning' and 'ai',
        // which allowed Post Ai3 ('neural networks', 'ai') to find it.
        // If it didn't work, AI posts would be far apart.
    });
});
