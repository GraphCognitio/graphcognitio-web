export type ConversationNodeResponse = {
  id: string;
  authorId: string;
  authorName: string;
  contentPreview: string;
  createdAt: string;
  parentId: string | null;
  rootId: string;
  replyCount: number;
};

export type ConversationEdgeResponse = {
  id: string;
  sourcePostId: string;
  targetPostId: string;
  type: "REPLY";
  createdAt: string;
};

export type ConversationGraphResponse = {
  nodes: ConversationNodeResponse[];
  edges: ConversationEdgeResponse[];
};

export type ConversationFlowNodeData = {
  authorName: string;
  contentPreview: string;
  createdAt: string;
  replyCount: number;
};
