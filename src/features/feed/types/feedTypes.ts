export type PostResponse = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  rootId: string;
  replyCount: number;
};

export type FeedResponse = {
  items: PostResponse[];
  nextCursor: string | null;
};
