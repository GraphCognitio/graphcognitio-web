import type { PropsWithChildren } from "react";

type AeroModalProps = PropsWithChildren<{
  title: string;
  open: boolean;
  onClose: () => void;
}>;

export function AeroModal({ title, open, onClose, children }: AeroModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyan-950/35 p-4 backdrop-blur-sm">
      <article className="aero-glass w-full max-w-lg p-6">
        <header className="mb-4 flex items-center justify-between gap-4">
          <h2 className="aero-heading text-xl font-bold">{title}</h2>
          <button
            aria-label="Close modal"
            className="aero-focus-ring rounded-full border border-white/70 bg-white/40 px-3 py-1 text-sm text-sky-900"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </header>
        <div>{children}</div>
      </article>
    </div>
  );
}
