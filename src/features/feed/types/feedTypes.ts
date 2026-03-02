export type PostResponse = {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  parentId: string | null;
  rootId: string;
  replyCount: number;
  likeCount: number;
  likedByMe: boolean;
};

export type FeedResponse = {
  items: PostResponse[];
  nextCursor: string | null;
};

export type ContextClusterResponse = {
  mainTopic: string;
  topicKeywords: string[];
  highlights: PostResponse[];
};

export type ContextFeedResponse = {
  clusters: ContextClusterResponse[];
};
