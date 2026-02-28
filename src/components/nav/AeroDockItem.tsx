import type { ReactNode, Ref } from "react";
import { Link } from "react-router-dom";
import { AeroIconBadge } from "../ui/AeroIconBadge";

type DockTone = "cyan" | "lime" | "rose" | "violet";

type AeroDockItemProps = {
  active?: boolean;
  ariaLabel?: string;
  collapsed: boolean;
  icon: ReactNode;
  itemRef?: Ref<HTMLDivElement>;
  label: string;
  onActivate?: () => void;
  to?: string;
  tone?: DockTone;
};

export function AeroDockItem({
  active = false,
  ariaLabel,
  collapsed,
  icon,
  itemRef,
  label,
  onActivate,
  to,
  tone = "cyan",
}: AeroDockItemProps) {
  const commonClassName = `aero-dock-item-control aero-focus-ring ${active ? "is-active" : ""}`;
  const content = (
    <>
      <AeroIconBadge className="aero-dock-item-orb h-11 w-11" tone={tone}>
        {icon}
      </AeroIconBadge>
      <span className={`aero-dock-item-label ${collapsed ? "is-hidden" : ""}`}>{label}</span>
      <span className="aero-dock-tooltip" role="presentation">
        {label}
      </span>
      {active ? <span className="aero-dock-item-indicator" aria-hidden="true" /> : null}
    </>
  );

  return (
    <div ref={itemRef} className={`aero-dock-item-shell ${active ? "is-active" : ""}`}>
      {to ? (
        <Link aria-label={ariaLabel ?? label} className={commonClassName} onClick={onActivate} to={to}>
          {content}
        </Link>
      ) : (
        <button aria-label={ariaLabel ?? label} className={commonClassName} onClick={onActivate} type="button">
          {content}
        </button>
      )}
    </div>
  );
}

export type { DockTone };
