import type { PostResponse } from "../../feed/types/feedTypes";

export type RelatedPostResponse = PostResponse & {
  topicScore: number;
  topicKeywords: string[];
  topicReason: string;
};
