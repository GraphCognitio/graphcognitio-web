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
import { AuthShowcase } from "../components/AuthShowcase";
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
  const [confirmPassword, setConfirmPassword] = useState("");

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
  const passwordMismatch =
    confirmPassword.length > 0 && password.length > 0 && password !== confirmPassword
      ? "Passwords must match"
      : null;

  return (
    <AeroScene>
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <AuthShowcase
          eyebrow="Portfolio-ready fullstack"
          title="Start building your graph identity."
          description="Create an account to publish root posts, reply through layered conversations, like nodes, and navigate the graph-oriented social MVP."
        />

        <GlassCard className="mx-auto w-full max-w-md p-6 md:p-7">
          <header className="mb-5 space-y-2">
            <h2 className="aero-heading text-3xl font-black tracking-tight">Create Account</h2>
            <p className="aero-subtitle text-sm">Join GraphCognitio</p>
          </header>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (password !== confirmPassword) {
                return;
              }
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
            <AeroInput
              autoComplete="new-password"
              id="confirm-password"
              label="Confirm password"
              onChange={(event) => setConfirmPassword(event.currentTarget.value)}
              placeholder="Repeat your password"
              required
              type="password"
              value={confirmPassword}
            />
            <GelButton className="w-full" disabled={mutation.isPending || Boolean(passwordMismatch)} type="submit">
              {mutation.isPending ? <LoaderCircle aria-hidden="true" className="animate-spin" size={16} /> : null}
              Create account
            </GelButton>
          </form>

          {passwordMismatch ? (
            <div className="mt-4">
              <AeroToast message={passwordMismatch} variant="error" />
            </div>
          ) : null}

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
