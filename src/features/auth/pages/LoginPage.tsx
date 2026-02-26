import { Link } from "react-router-dom";
import { AeroScene } from "../../../components/layout/AeroScene";
import { AeroInput } from "../../../components/ui/AeroInput";
import { GelButton } from "../../../components/ui/GelButton";
import { GlassCard } from "../../../components/ui/GlassCard";

export function LoginPage() {
  return (
    <AeroScene>
      <div className="mx-auto mt-10 max-w-md">
        <GlassCard>
          <header className="mb-5 space-y-2">
            <h1 className="aero-heading text-3xl font-black tracking-tight">GraphCognitio</h1>
            <p className="aero-subtitle text-sm">Sign in to continue</p>
          </header>
          <div className="space-y-4">
            <AeroInput autoComplete="email" id="email" label="Email" placeholder="you@example.com" type="email" />
            <AeroInput id="password" label="Password" placeholder="••••••••" type="password" />
            <GelButton className="w-full">Enter</GelButton>
          </div>
          <p className="mt-4 text-sm text-sky-900/80">
            New here?{" "}
            <Link className="font-semibold text-sky-800 underline decoration-sky-500/60" to="/register">
              Create an account
            </Link>
          </p>
        </GlassCard>
      </div>
    </AeroScene>
  );
}
