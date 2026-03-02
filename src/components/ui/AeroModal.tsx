import type { PropsWithChildren } from "react";
import { createPortal } from "react-dom";

type AeroModalProps = PropsWithChildren<{
  title: string;
  open: boolean;
  onClose: () => void;
}>;

export function AeroModal({ title, open, onClose, children }: AeroModalProps) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="aero-modal-backdrop fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <article className="aero-panel w-full max-w-lg p-6">
        <header className="mb-4 flex items-center justify-between gap-4">
          <h2 className="aero-heading text-xl font-bold">{title}</h2>
          <button
            aria-label="Close modal"
            className="relative overflow-hidden aero-focus-ring rounded-full border border-white/90 bg-gradient-to-b from-orange-400 to-orange-600 px-3 py-1 text-sm font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] shadow-[0_4px_8px_rgba(0,0,0,0.15),inset_0_2px_0_rgba(255,255,255,0.9),inset_0_-2px_0_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:scale-105 transition-all"
            onClick={onClose}
            type="button"
          >
            <span className="absolute inset-x-0.5 top-0.5 h-[45%] rounded-[999px_999px_200px_200px/999px] bg-gradient-to-b from-white/95 to-white/10 pointer-events-none" />
            <span className="relative z-10 drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]">Fechar</span>
          </button>
        </header>
        <div>{children}</div>
      </article>
    </div>,
    document.body
  );
}
