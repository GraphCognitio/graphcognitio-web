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
    <div className="aero-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
      <article className="aero-panel w-full max-w-lg p-6">
        <header className="mb-4 flex items-center justify-between gap-4">
          <h2 className="aero-heading text-xl font-bold">{title}</h2>
          <button
            aria-label="Close modal"
            className="aero-focus-ring rounded-full border border-white/80 bg-white/60 px-3 py-1 text-sm font-semibold text-sky-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_5px_10px_-7px_rgba(10,82,142,0.55)]"
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
