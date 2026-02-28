import { Network, ShieldCheck, Sparkles } from "lucide-react";
import { AeroIconBadge } from "../../../components/ui/AeroIconBadge";

type AuthShowcaseProps = {
  eyebrow: string;
  title: string;
  description: string;
};

const highlights = [
  {
    icon: Network,
    tone: "cyan" as const,
    title: "Graph-first conversations",
    description: "Root posts, replies, and conversation layers visualized as connected structures.",
  },
  {
    icon: ShieldCheck,
    tone: "lime" as const,
    title: "Secure by design",
    description: "JWT auth, RBAC, rate limiting, idempotency, and hardened defaults in the backend.",
  },
  {
    icon: Sparkles,
    tone: "violet" as const,
    title: "Frutiger Aero interface",
    description: "Infinite feed canvas, retro glossy UI, and a graph explorer tuned for portfolio impact.",
  },
];

export function AuthShowcase({ eyebrow, title, description }: AuthShowcaseProps) {
  return (
    <section className="aero-panel aero-float relative overflow-hidden px-6 py-7 md:px-8 md:py-9">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-b-[2.4rem] bg-white/20 blur-2xl" />
      <div className="relative z-10">
        <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-sky-700/80">{eyebrow}</p>
        <h1 className="aero-heading max-w-lg text-4xl font-black leading-tight md:text-5xl">{title}</h1>
        <p className="aero-subtitle mt-4 max-w-xl text-base leading-7">{description}</p>

        <div className="mt-7 grid gap-4">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[1.4rem] border border-sky-200/80 bg-white/35 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_14px_28px_-18px_rgba(8,79,133,0.48)] backdrop-blur-[1px]"
              >
                <div className="flex items-start gap-3">
                  <AeroIconBadge tone={item.tone}>
                    <Icon size={15} />
                  </AeroIconBadge>
                  <div className="space-y-1.5">
                    <h2 className="text-sm font-black uppercase tracking-[0.16em] text-sky-800/85">{item.title}</h2>
                    <p className="text-sm leading-6 text-sky-900/78">{item.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.4rem] border border-sky-200/75 bg-cyan-50/45 px-4 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
            <p className="text-2xl font-black text-sky-800">JWT</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-700/75">Auth flow</p>
          </div>
          <div className="rounded-[1.4rem] border border-lime-200/75 bg-lime-50/40 px-4 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
            <p className="text-2xl font-black text-emerald-700">BFS</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700/75">Graph traversal</p>
          </div>
          <div className="rounded-[1.4rem] border border-violet-200/75 bg-violet-50/35 px-4 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
            <p className="text-2xl font-black text-violet-700">AERO</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-violet-700/75">Retro visual</p>
          </div>
        </div>
      </div>
    </section>
  );
}
