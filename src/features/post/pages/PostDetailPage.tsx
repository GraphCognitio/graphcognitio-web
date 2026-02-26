import { useParams } from "react-router-dom";
import { AeroScene } from "../../../components/layout/AeroScene";
import { GlassCard } from "../../../components/ui/GlassCard";

export function PostDetailPage() {
  const { id } = useParams();

  return (
    <AeroScene>
      <GlassCard className="mx-auto mt-8 max-w-3xl">
        <h1 className="aero-heading text-2xl font-black">Post detail</h1>
        <p className="aero-subtitle mt-2 text-sm">Post ID: {id}</p>
      </GlassCard>
    </AeroScene>
  );
}
