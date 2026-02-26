import { useParams } from "react-router-dom";
import { AeroScene } from "../../../components/layout/AeroScene";
import { GlassCard } from "../../../components/ui/GlassCard";

export function GraphPage() {
  const { rootId } = useParams();

  return (
    <AeroScene>
      <GlassCard className="mx-auto mt-8 max-w-4xl">
        <h1 className="aero-heading text-2xl font-black">Conversation graph</h1>
        <p className="aero-subtitle mt-2 text-sm">Root ID: {rootId}</p>
      </GlassCard>
    </AeroScene>
  );
}
