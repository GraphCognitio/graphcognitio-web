import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Activity, Cpu, History, LoaderCircle, RotateCcw, Search, Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getEmbeddingsHistory, getEmbeddingsStatus, reindexEmbeddings, searchAdminUsers, updateUserRole } from "../../../api/adminApi";
import { AppShell, createBackDockAction } from "../../../components/layout/AppShell";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";
import { AeroInput } from "../../../components/ui/AeroInput";
import { AeroToast } from "../../../components/ui/AeroToast";
import { GelButton } from "../../../components/ui/GelButton";
import { GlassCard } from "../../../components/ui/GlassCard";
import { useAuth } from "../../auth/hooks/useAuth";
import type { AuthRole } from "../../auth/types/authTypes";
import type { AdminUserResponse, EmbeddingReindexHistoryEntry, EmbeddingReindexResponse } from "../types/adminTypes";

type ProblemDetail = {
  detail?: string;
};

const ROLE_OPTIONS: AuthRole[] = ["USER", "MOD", "ADMIN"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SEARCH_LIMIT = 8;

function statusTone(status: string) {
  const normalizedStatus = status.toUpperCase();
  if (normalizedStatus === "UP") {
    return {
      badgeClass: "border-emerald-200/90 bg-emerald-100/75 text-emerald-700",
      dotClass: "bg-emerald-500",
      label: "Healthy",
    };
  }
  if (normalizedStatus === "UNKNOWN") {
    return {
      badgeClass: "border-amber-200/90 bg-amber-100/75 text-amber-700",
      dotClass: "bg-amber-500",
      label: "Unknown",
    };
  }
  return {
    badgeClass: "border-rose-200/90 bg-rose-100/75 text-rose-700",
    dotClass: "bg-rose-500",
    label: "Needs action",
  };
}

export function AdminRolesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userId, setUserId] = useState(searchParams.get("userId") ?? "");
  const [directoryQuery, setDirectoryQuery] = useState(searchParams.get("name") ?? "");
  const [debouncedDirectoryQuery, setDebouncedDirectoryQuery] = useState(searchParams.get("name") ?? "");
  const [targetRole, setTargetRole] = useState<AuthRole>("MOD");
  const [result, setResult] = useState<AdminUserResponse | null>(null);
  const [reindexScope, setReindexScope] = useState<"missing" | "all">("missing");
  const [reindexLimit, setReindexLimit] = useState("200");
  const [reindexResult, setReindexResult] = useState<EmbeddingReindexResponse | null>(null);

  useEffect(() => {
    setUserId(searchParams.get("userId") ?? "");
    setDirectoryQuery(searchParams.get("name") ?? "");
    setDebouncedDirectoryQuery(searchParams.get("name") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedDirectoryQuery(directoryQuery.trim());
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [directoryQuery]);

  const targetNameHint = searchParams.get("name")?.trim() ?? "";
  const normalizedUserId = userId.trim();
  const isValidUserId = UUID_PATTERN.test(normalizedUserId);
  const isSelfTarget = user?.id === normalizedUserId;
  const normalizedDirectoryQuery = debouncedDirectoryQuery.trim();

  const userSearchQuery = useQuery({
    queryKey: ["admin", "users", normalizedDirectoryQuery, SEARCH_LIMIT],
    queryFn: () => searchAdminUsers(normalizedDirectoryQuery, SEARCH_LIMIT),
  });

  const embeddingsStatusQuery = useQuery({
    queryKey: ["admin", "embeddings", "status"],
    queryFn: getEmbeddingsStatus,
    refetchInterval: 15_000,
  });

  const HISTORY_LIMIT = 5;
  const embeddingsHistoryQuery = useQuery<EmbeddingReindexHistoryEntry[]>({
    queryKey: ["admin", "embeddings", "history", HISTORY_LIMIT],
    queryFn: () => getEmbeddingsHistory(HISTORY_LIMIT),
    refetchInterval: 30_000,
  });

  const updateRoleMutation = useMutation({
    mutationFn: () => updateUserRole({ userId: normalizedUserId, role: targetRole }),
    onSuccess: (updatedUser) => {
      setResult(updatedUser);
      setTargetRole(updatedUser.role);

      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("userId", updatedUser.id);
      nextParams.set("name", updatedUser.name);
      setSearchParams(nextParams, { replace: true });
    },
  });

  const reindexMutation = useMutation({
    mutationFn: () => reindexEmbeddings(reindexScope, Number.parseInt(reindexLimit, 10) || 200),
    onSuccess: (response) => {
      setReindexResult(response);
      void queryClient.invalidateQueries({ queryKey: ["admin", "embeddings", "status"] });
    },
  });

  const updateError = (updateRoleMutation.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;
  const searchError = (userSearchQuery.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;
  const embeddingsError = (embeddingsStatusQuery.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;
  const reindexError = (reindexMutation.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;
  const searchedUsers = userSearchQuery.data ?? [];
  const embeddingsStatus = embeddingsStatusQuery.data ?? null;
  const reindexLimitNumber = Number.parseInt(reindexLimit, 10);
  const isValidReindexLimit = Number.isFinite(reindexLimitNumber) && reindexLimitNumber >= 1 && reindexLimitNumber <= 1000;
  const healthTone = statusTone(embeddingsStatus?.status ?? "UNKNOWN");
  const historyEntries = embeddingsHistoryQuery.data ?? [];
  const historyError = (embeddingsHistoryQuery.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;
  const historyLoading = embeddingsHistoryQuery.isLoading;
  const helperCopy = useMemo(() => {
    if (targetNameHint) {
      return `Target prefilled from ${targetNameHint}. You can still search and switch the target below.`;
    }

    return "Search by name or email, or use admin shortcuts from the feed, post detail or graph.";
  }, [targetNameHint]);

  return (
    <AppShell
      contentClassName="max-w-[72rem] p-4 md:p-6"
      contextualActions={[
        createBackDockAction(() => window.history.back()),
      ]}
    >
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="aero-heading text-3xl font-black">Role Control</h1>
            <p className="aero-subtitle text-sm">
              Promote or demote a user by UUID. JWT role changes become effective on the next sign-in.
            </p>
          </div>
          <span className="aero-pill inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-sky-900">
            <AeroIconBadge className="h-5 w-5" tone="violet">
              <Shield aria-hidden="true" size={10} />
            </AeroIconBadge>
            {user?.role ?? "ADMIN"}
          </span>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
          <GlassCard>
            <header className="mb-4 border-b border-white/35 pb-4">
              <h2 className="aero-heading text-xl font-black">Update User Role</h2>
              <p className="aero-subtitle mt-1 text-sm">{helperCopy}</p>
            </header>

            <div className="mb-5 space-y-4 rounded-[1.6rem] border border-white/45 bg-white/24 px-4 py-4">
              <div className="flex items-center gap-2">
                <AeroIconBadge className="h-5 w-5" tone="cyan">
                  <Search aria-hidden="true" size={10} />
                </AeroIconBadge>
                <div>
                  <p className="text-sm font-black text-sky-950">User Directory</p>
                  <p className="text-xs text-sky-900/70">Blank query shows the most recent accounts.</p>
                </div>
              </div>

              <AeroInput
                autoComplete="off"
                id="admin-user-directory"
                label="Search by name or email"
                onChange={(event) => setDirectoryQuery(event.currentTarget.value)}
                placeholder="Search users..."
                value={directoryQuery}
              />

              {userSearchQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-sky-900">
                  <LoaderCircle aria-hidden="true" className="animate-spin" size={14} />
                  Searching users
                </div>
              ) : null}

              {userSearchQuery.isError ? (
                <AeroToast message={searchError ?? "Unable to search users"} variant="error" />
              ) : null}

              {!userSearchQuery.isLoading && !userSearchQuery.isError ? (
                searchedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {searchedUsers.map((candidate) => {
                      const isSelected = candidate.id === normalizedUserId;

                      return (
                        <button
                          key={candidate.id}
                          className={`flex w-full flex-col gap-1 rounded-[1.3rem] border px-4 py-3 text-left transition ${
                            isSelected
                              ? "border-cyan-200/95 bg-cyan-50/60 shadow-[0_16px_36px_rgba(8,145,178,0.16)]"
                              : "border-white/45 bg-white/24 hover:bg-white/34"
                          }`}
                          onClick={() => {
                            setUserId(candidate.id);
                            setTargetRole(candidate.role);

                            const nextParams = new URLSearchParams(searchParams);
                            nextParams.set("userId", candidate.id);
                            nextParams.set("name", candidate.name);
                            setSearchParams(nextParams, { replace: true });
                          }}
                          type="button"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-black text-sky-950">{candidate.name}</p>
                            <span className="rounded-full border border-violet-200/80 bg-violet-100/70 px-3 py-1 text-[10px] font-black tracking-[0.08em] text-violet-700">
                              {candidate.role}
                            </span>
                          </div>
                          <p className="text-xs text-sky-900/72">{candidate.email}</p>
                          <p className="font-mono text-[11px] text-sky-900/60">{candidate.id}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-white/45 bg-white/20 px-4 py-4 text-sm text-sky-900/75">
                    No users matched this search.
                  </div>
                )
              ) : null}
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!isValidUserId || updateRoleMutation.isPending) {
                  return;
                }
                updateRoleMutation.mutate();
              }}
            >
              <AeroInput
                autoComplete="off"
                id="admin-role-user-id"
                label="User UUID"
                onChange={(event) => setUserId(event.currentTarget.value)}
                placeholder="00000000-0000-0000-0000-000000000000"
                spellCheck={false}
                value={userId}
              />

              <label className="flex flex-col gap-2 text-sm" htmlFor="admin-role-select">
                <span className="aero-input-label">Target Role</span>
                <select
                  id="admin-role-select"
                  className="aero-input"
                  onChange={(event) => setTargetRole(event.currentTarget.value as AuthRole)}
                  value={targetRole}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1 text-xs text-sky-900/70">
                  <p>{isValidUserId ? "UUID looks valid." : "Enter a valid UUID to enable submission."}</p>
                  {isSelfTarget ? <p>This target matches your current account.</p> : null}
                  {searchedUsers.some((candidate) => candidate.id === normalizedUserId) ? <p>Selected from directory.</p> : null}
                </div>
                <GelButton aria-label="Update selected user role" disabled={!isValidUserId || updateRoleMutation.isPending} type="submit">
                  {updateRoleMutation.isPending ? (
                    <LoaderCircle aria-hidden="true" className="animate-spin" size={14} />
                  ) : (
                    <AeroIconBadge className="h-4 w-4" tone="violet">
                      <Shield aria-hidden="true" size={9} />
                    </AeroIconBadge>
                  )}
                  Apply role
                </GelButton>
              </div>
            </form>

            {updateRoleMutation.isError ? (
              <div className="mt-4">
                <AeroToast message={updateError ?? "Unable to update user role"} variant="error" />
              </div>
            ) : null}
            {updateRoleMutation.isSuccess ? (
              <div className="mt-4">
                <AeroToast message="User role updated" variant="success" />
              </div>
            ) : null}
          </GlassCard>

          <GlassCard>
            <header className="mb-4 border-b border-white/35 pb-4">
              <h2 className="aero-heading text-xl font-black">Last Result</h2>
              <p className="aero-subtitle mt-1 text-sm">The API returns the updated user snapshot after a successful role change.</p>
            </header>

            {result ? (
              <div className="space-y-3 text-sm text-sky-950/92">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-900/60">Name</p>
                  <p className="mt-1 text-base font-black text-sky-950">{result.name}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-900/60">Email</p>
                  <p className="mt-1 break-all">{result.email}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-900/60">Role</p>
                  <p className="mt-1 inline-flex rounded-full border border-violet-200/80 bg-violet-100/70 px-3 py-1 text-xs font-black tracking-[0.08em] text-violet-700">
                    {result.role}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-900/60">User ID</p>
                  <p className="mt-1 break-all font-mono text-[12px]">{result.id}</p>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-sky-900/60">Created At</p>
                  <p className="mt-1">{new Date(result.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-white/45 bg-white/20 px-4 py-5 text-sm font-medium text-sky-900/75">
                No role update has been submitted in this session yet.
              </div>
            )}
          </GlassCard>
        </div>

        <GlassCard>
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-white/35 pb-4">
            <div>
              <h2 className="aero-heading text-xl font-black">Embeddings Operations</h2>
              <p className="aero-subtitle mt-1 text-sm">
                Operational view for the semantic layer powering feed relevance, search and topic graph.
              </p>
            </div>
            {embeddingsStatus ? (
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] ${healthTone.badgeClass}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${healthTone.dotClass}`} />
                {healthTone.label}
              </span>
            ) : null}
          </header>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4 rounded-[1.6rem] border border-white/45 bg-white/24 px-4 py-4">
              <div className="flex items-center gap-2">
                <AeroIconBadge className="h-5 w-5" tone="cyan">
                  <Activity aria-hidden="true" size={10} />
                </AeroIconBadge>
                <div>
                  <p className="text-sm font-black text-sky-950">Status Snapshot</p>
                  <p className="text-xs text-sky-900/70">Auto-refreshes every 15 seconds while this page stays open.</p>
                </div>
              </div>

              {embeddingsStatusQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm font-semibold text-sky-900">
                  <LoaderCircle aria-hidden="true" className="animate-spin" size={14} />
                  Loading embeddings status
                </div>
              ) : null}

              {embeddingsStatusQuery.isError ? (
                <AeroToast message={embeddingsError ?? "Unable to load embeddings status"} variant="error" />
              ) : null}

              {embeddingsStatus ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatusMetric label="Health" value={embeddingsStatus.status} />
                  <StatusMetric label="Provider" value={embeddingsStatus.provider} />
                  <StatusMetric label="Model" value={embeddingsStatus.model} />
                  <StatusMetric label="Dimensions" value={String(embeddingsStatus.dimensions)} />
                  <StatusMetric label="Enabled" value={embeddingsStatus.enabled ? "Yes" : "No"} />
                  <StatusMetric label="Reindex batch size" value={String(embeddingsStatus.reindexBatchSize)} />
                  {embeddingsStatus.remoteProvider ? (
                    <>
                      <StatusMetric label="API key configured" value={embeddingsStatus.apiKeyConfigured ? "Yes" : "No"} />
                      <StatusMetric label="Remote endpoint" value={`${embeddingsStatus.remoteBaseUrl ?? ""}${embeddingsStatus.remotePath ?? ""}`} />
                    </>
                  ) : (
                    <StatusMetric label="Provider mode" value="Local / in-process" />
                  )}
                </div>
              ) : null}

              {embeddingsStatus?.reason ? (
                <div className="rounded-[1.25rem] border border-rose-200/80 bg-rose-50/75 px-4 py-3 text-sm font-medium text-rose-700">
                  {embeddingsStatus.reason}
                </div>
              ) : null}
            </div>

            <div className="space-y-4 rounded-[1.6rem] border border-white/45 bg-white/24 px-4 py-4">
              <div className="flex items-center gap-2">
                <AeroIconBadge className="h-5 w-5" tone="violet">
                  <Cpu aria-hidden="true" size={10} />
                </AeroIconBadge>
                <div>
                  <p className="text-sm font-black text-sky-950">Reindex Queue</p>
                  <p className="text-xs text-sky-900/70">Trigger backfill when the provider, model or backlog changes.</p>
                </div>
              </div>

              <label className="flex flex-col gap-2 text-sm" htmlFor="admin-embeddings-scope">
                <span className="aero-input-label">Scope</span>
                <select
                  id="admin-embeddings-scope"
                  className="aero-input"
                  onChange={(event) => setReindexScope(event.currentTarget.value as "missing" | "all")}
                  value={reindexScope}
                >
                  <option value="missing">Missing only</option>
                  <option value="all">Reindex all</option>
                </select>
              </label>

              <AeroInput
                autoComplete="off"
                id="admin-embeddings-limit"
                inputMode="numeric"
                label="Limit"
                onChange={(event) => setReindexLimit(event.currentTarget.value)}
                placeholder="200"
                value={reindexLimit}
              />

              <div className="space-y-1 text-xs text-sky-900/70">
                <p>{isValidReindexLimit ? "Batch limit looks valid." : "Use a limit between 1 and 1000."}</p>
                <p>The backend still caps the batch to the configured maximum.</p>
              </div>

              <GelButton
                aria-label="Trigger embeddings reindex"
                disabled={!isValidReindexLimit || reindexMutation.isPending}
                onClick={() => reindexMutation.mutate()}
                type="button"
              >
                {reindexMutation.isPending ? (
                  <LoaderCircle aria-hidden="true" className="animate-spin" size={14} />
                ) : (
                  <AeroIconBadge className="h-4 w-4" tone="violet">
                    <RotateCcw aria-hidden="true" size={9} />
                  </AeroIconBadge>
                )}
                Run reindex
              </GelButton>

              {reindexMutation.isError ? (
                <AeroToast message={reindexError ?? "Unable to trigger embeddings reindex"} variant="error" />
              ) : null}

              {reindexResult ? (
                <div className="rounded-[1.3rem] border border-emerald-200/80 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
                  <p className="font-black">Last reindex accepted</p>
                  <p className="mt-1">
                    Scope: {reindexResult.scope} · Reindexed: {reindexResult.reindexedCount} · Model: {reindexResult.model}
                  </p>
                </div>
              ) : (
                <div className="rounded-[1.3rem] border border-dashed border-white/45 bg-white/20 px-4 py-4 text-sm text-sky-900/75">
                  No embeddings reindex has been triggered in this session yet.
                </div>
              )}
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-white/35 pb-4">
            <div>
              <h2 className="aero-heading text-xl font-black">Reindex History</h2>
              <p className="aero-subtitle mt-1 text-sm">Latest embedding backfills logged in the audit trail.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-sky-900/60">
              <History aria-hidden="true" size={12} />
              Last {historyEntries.length || HISTORY_LIMIT}
            </span>
          </header>

          {historyLoading ? (
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-900">
              <LoaderCircle aria-hidden="true" className="animate-spin" size={14} />
              Loading history
            </div>
          ) : null}

          {historyError ? (
            <AeroToast message={historyError} variant="error" />
          ) : null}

          {historyEntries.length === 0 && !historyLoading && !historyError ? (
            <div className="rounded-[1.4rem] border border-dashed border-white/45 bg-white/20 px-4 py-4 text-sm text-sky-900/75">
              No reindex activity recorded yet.
            </div>
          ) : null}

          {historyEntries.length > 0 ? (
            <div className="space-y-3">
              {historyEntries.map((entry) => (
                <HistoryEntry key={entry.id} entry={entry} />
              ))}
            </div>
          ) : null}
        </GlassCard>
      </div>
    </AppShell>
  );
}

type StatusMetricProps = {
  label: string;
  value: string;
};

function StatusMetric({ label, value }: StatusMetricProps) {
  return (
    <div className="rounded-[1.25rem] border border-white/45 bg-white/34 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-900/58">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-sky-950">{value}</p>
    </div>
  );
}

type HistoryEntryProps = {
  entry: EmbeddingReindexHistoryEntry;
};

function HistoryEntry({ entry }: HistoryEntryProps) {
  return (
    <div className="rounded-[1.4rem] border border-white/35 bg-white/20 px-4 py-3">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-900/55">When</p>
        <p className="text-sm font-semibold text-sky-950">{new Date(entry.createdAt).toLocaleString()}</p>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-900/55">Actor</p>
          <p className="font-semibold text-sky-900">{entry.actorName}</p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-900/55">Scope</p>
          <p className="font-semibold text-sky-900">{entry.scope}</p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-900/55">Reindexed</p>
          <p className="font-semibold text-sky-900">{entry.reindexedCount}</p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-900/55">Model</p>
          <p className="font-semibold text-sky-900">{entry.model}</p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-900/55">Dimensions</p>
          <p className="font-semibold text-sky-900">{entry.dimensions}</p>
        </div>
      </div>
    </div>
  );
}
