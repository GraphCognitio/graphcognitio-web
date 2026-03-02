import { apiClient } from "./client";
import type {
  AdminUserResponse,
  EmbeddingReindexHistoryEntry,
  EmbeddingReindexResponse,
  EmbeddingsStatusResponse,
  UpdateUserRolePayload,
} from "../features/admin/types/adminTypes";

export async function searchAdminUsers(query = "", limit = 8) {
  const response = await apiClient.get<AdminUserResponse[]>("/admin/users", {
    params: {
      query,
      limit,
    },
  });
  return response.data;
}

export async function updateUserRole({ userId, role }: UpdateUserRolePayload) {
  const response = await apiClient.patch<AdminUserResponse>(`/admin/users/${userId}/role`, { role });
  return response.data;
}

export async function getEmbeddingsStatus() {
  const response = await apiClient.get<EmbeddingsStatusResponse>("/admin/embeddings/status");
  return response.data;
}

export async function reindexEmbeddings(scope: "missing" | "all", limit: number) {
  const response = await apiClient.post<EmbeddingReindexResponse>("/admin/embeddings/reindex", null, {
    params: {
      scope,
      limit,
    },
  });
  return response.data;
}

export async function getEmbeddingsHistory(limit = 5) {
  const response = await apiClient.get<EmbeddingReindexHistoryEntry[]>("/admin/embeddings/history", {
    params: {
      limit,
    },
  });
  return response.data;
}
