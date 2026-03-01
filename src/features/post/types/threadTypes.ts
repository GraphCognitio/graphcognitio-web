import type { PostResponse } from "../../feed/types/feedTypes";

export type ThreadNodeResponse = {
  post: PostResponse;
  replies: ThreadNodeResponse[];
};

export type PostThreadResponse = {
  ancestors: PostResponse[];
  focus: PostResponse;
  replies: ThreadNodeResponse[];
};
