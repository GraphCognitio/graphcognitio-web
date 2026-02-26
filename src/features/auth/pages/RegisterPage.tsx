import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { registerRequest } from "../../../api/authApi";
import { AeroScene } from "../../../components/layout/AeroScene";
import { AeroInput } from "../../../components/ui/AeroInput";
import { AeroToast } from "../../../components/ui/AeroToast";
import { GelButton } from "../../../components/ui/GelButton";
import { GlassCard } from "../../../components/ui/GlassCard";
import { useAuth } from "../hooks/useAuth";

type ProblemDetail = {
  detail?: string;
};

export function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, persistAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      persistAuth(data);
      navigate("/feed", { replace: true });
    },
  });

  if (isAuthenticated) {
    return <Navigate replace to="/feed" />;
  }

  const errorDetail = (mutation.error as AxiosError<ProblemDetail> | null)?.response?.data?.detail;

  return (
    <AeroScene>
      <div className="mx-auto mt-8 max-w-md">
        <GlassCard>
          <header className="mb-5 space-y-2">
            <h1 className="aero-heading text-3xl font-black tracking-tight">Create Account</h1>
            <p className="aero-subtitle text-sm">Join GraphCognitio</p>
          </header>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate({ name, email, password });
            }}
          >
            <AeroInput
              id="name"
              label="Name"
              onChange={(event) => setName(event.currentTarget.value)}
              placeholder="Eduardo"
              required
              type="text"
              value={name}
            />
            <AeroInput
              autoComplete="email"
              id="email"
              label="Email"
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
            <AeroInput
              autoComplete="new-password"
              id="password"
              label="Password"
              onChange={(event) => setPassword(event.currentTarget.value)}
              placeholder="Create a strong password"
              required
              type="password"
              value={password}
            />
            <GelButton className="w-full" disabled={mutation.isPending} type="submit">
              {mutation.isPending ? <LoaderCircle aria-hidden="true" className="animate-spin" size={16} /> : null}
              Create account
            </GelButton>
          </form>

          {mutation.isError ? (
            <div className="mt-4">
              <AeroToast message={errorDetail ?? "Unable to register"} variant="error" />
            </div>
          ) : null}

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
