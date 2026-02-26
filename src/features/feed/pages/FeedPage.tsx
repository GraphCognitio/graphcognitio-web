import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AeroScene } from "../../../components/layout/AeroScene";
import { GelButton } from "../../../components/ui/GelButton";
import { useAuth } from "../../auth/hooks/useAuth";
import { FeedCanvas } from "../components/FeedCanvas";

export function FeedPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  return (
    <AeroScene>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="aero-heading text-3xl font-black">GraphCognitio Feed</h1>
          <p className="aero-subtitle text-sm">Infinite pan canvas of root posts</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="aero-glass px-3 py-2 text-xs font-semibold text-sky-900">{user?.name ?? "Guest"}</span>
          <GelButton
            aria-label="Logout"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut aria-hidden="true" size={14} />
            Logout
          </GelButton>
        </div>
      </header>

      <FeedCanvas />
    </AeroScene>
  );
}
