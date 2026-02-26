import { AeroScene } from "../../../components/layout/AeroScene";
import { GelButton } from "../../../components/ui/GelButton";
import { GlassCard } from "../../../components/ui/GlassCard";

export function FeedPage() {
  return (
    <AeroScene>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="aero-heading text-3xl font-black">Feed Canvas</h1>
          <p className="aero-subtitle">Infinite pan space for root posts</p>
        </div>
        <GelButton aria-label="Create post">New post</GelButton>
      </header>

      <GlassCard className="min-h-[420px] p-0">
        <div className="flex min-h-[420px] items-center justify-center text-sm font-semibold text-sky-900/70">
          Feed canvas will be implemented in the next step.
        </div>
      </GlassCard>
    </AeroScene>
  );
}
