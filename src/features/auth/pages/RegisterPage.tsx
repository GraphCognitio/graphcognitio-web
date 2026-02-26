import { Link } from "react-router-dom";
import { AeroScene } from "../../../components/layout/AeroScene";
import { AeroInput } from "../../../components/ui/AeroInput";
import { GelButton } from "../../../components/ui/GelButton";
import { GlassCard } from "../../../components/ui/GlassCard";

export function RegisterPage() {
  return (
    <AeroScene>
      <div className="mx-auto mt-8 max-w-md">
        <GlassCard>
          <header className="mb-5 space-y-2">
            <h1 className="aero-heading text-3xl font-black tracking-tight">Create Account</h1>
            <p className="aero-subtitle text-sm">Join GraphCognitio</p>
          </header>
          <div className="space-y-4">
            <AeroInput id="name" label="Name" placeholder="Eduardo" type="text" />
            <AeroInput autoComplete="email" id="email" label="Email" placeholder="you@example.com" type="email" />
            <AeroInput id="password" label="Password" placeholder="Create a strong password" type="password" />
            <GelButton className="w-full">Create account</GelButton>
          </div>
          <p className="mt-4 text-sm text-sky-900/80">
            Already registered?{" "}
            <Link className="font-semibold text-sky-800 underline decoration-sky-500/60" to="/login">
              Back to login
            </Link>
          </p>
        </GlassCard>
      </div>
    </AeroScene>
  );
}
