import type { AuthRole } from "../../auth/types/authTypes";

export type AdminUserResponse = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  createdAt: string;
};

export type UpdateUserRolePayload = {
  role: AuthRole;
  userId: string;
};

export type EmbeddingsStatusResponse = {
  status: string;
  enabled: boolean;
  provider: string;
  model: string;
  dimensions: number;
  reindexBatchSize: number;
  remoteProvider: boolean;
  apiKeyConfigured: boolean | null;
  remoteBaseUrl: string | null;
  remotePath: string | null;
  reason: string | null;
};

export type EmbeddingReindexResponse = {
  scope: string;
  reindexedCount: number;
  model: string;
  dimensions: number;
};

export type EmbeddingReindexHistoryEntry = {
  id: string;
  createdAt: string;
  actorUserId: string;
  actorName: string;
  scope: string;
  reindexedCount: number;
  model: string;
  dimensions: number;
};
