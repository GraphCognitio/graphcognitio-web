import { House, PanelLeftClose, PanelLeftOpen, Waves } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useFisheyeDock } from "./useFisheyeDock";
import { AeroDockItem, type DockTone } from "./AeroDockItem";

type DockRouteItem = {
  icon: ReactNode;
  label: string;
  requiresAuth: boolean;
  route: string;
  tone?: DockTone;
};

export type AeroDockActionItem = {
  icon: ReactNode;
  id: string;
  label: string;
  onActivate: () => void;
  tone?: DockTone;
};

type AeroDockSidebarProps = {
  actions?: AeroDockActionItem[];
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
};

const routeItems: DockRouteItem[] = [
  {
    label: "Feed",
    route: "/feed",
    icon: <House aria-hidden="true" size={18} />,
    requiresAuth: true,
    tone: "cyan",
  },
];

export function AeroDockSidebar({ actions, collapsed, onCollapsedChange }: AeroDockSidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const desktopDock = useFisheyeDock();
  const mobileDock = useFisheyeDock({ amplitude: 0.26, sigma: 96 });
  const dockActions = actions ?? [];

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const welcomeLabel = useMemo(() => {
    if (!user?.name) {
      return "Authenticated user";
    }

    return user.name;
  }, [user?.name]);

  return (
    <>
      <aside className={`aero-dock-sidebar hidden lg:flex ${collapsed ? "is-collapsed" : "is-expanded"}`} aria-label="Primary navigation">
          <div className="aero-dock-brand">
            {collapsed ? <span aria-hidden="true" /> : (
              <div>
                <p className="aero-dock-brand-mark">GraphCognitio</p>
                <p className="aero-dock-brand-copy">Aero dock navigation</p>
              </div>
            )}
            <button
              aria-label={collapsed ? "Expand dock" : "Collapse dock"}
              className="aero-dock-toggle aero-focus-ring"
              onClick={() => onCollapsedChange(!collapsed)}
              type="button"
            >
              {collapsed ? <PanelLeftOpen aria-hidden="true" size={14} /> : <PanelLeftClose aria-hidden="true" size={14} />}
            </button>
          </div>

        <div className="aero-dock-bubbles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

          <nav
            className={`aero-dock-list ${collapsed ? "is-collapsed" : ""}`}
            onPointerLeave={desktopDock.handlePointerLeave}
            onPointerMove={desktopDock.handlePointerMove}
          >
            {routeItems
              .filter((item) => item.requiresAuth)
              .map((item) => (
                <AeroDockItem
                  key={item.route}
                  active={location.pathname === item.route}
                  collapsed={collapsed}
                  icon={item.icon}
                  itemRef={desktopDock.registerItem(item.route)}
                  label={item.label}
                  to={item.route}
                  tone={item.tone}
                />
              ))}
          </nav>

          {dockActions.length > 0 ? <div className="aero-dock-divider" /> : null}

          {dockActions.length > 0 ? (
            <div
              className={`aero-dock-list aero-dock-list--footer ${collapsed ? "is-collapsed" : ""}`}
              onPointerLeave={desktopDock.handlePointerLeave}
              onPointerMove={desktopDock.handlePointerMove}
            >
              {dockActions.map((action) => (
                <AeroDockItem
                  key={action.id}
                  collapsed={collapsed}
                  icon={action.icon}
                  itemRef={desktopDock.registerItem(`action:${action.id}`)}
                  label={action.label}
                  onActivate={action.onActivate}
                  tone={action.tone}
                />
              ))}
            </div>
          ) : null}

          <div className={`aero-dock-user ${collapsed ? "is-collapsed" : ""}`}>
            <div className="aero-dock-user-orb">
              <Waves aria-hidden="true" size={16} />
            </div>
            <div className="aero-dock-user-copy">
              <p className="aero-dock-user-name">{welcomeLabel}</p>
              <p className="aero-dock-user-role">Authenticated dock</p>
            </div>
          </div>
      </aside>

      {!mobileOpen ? (
        <button
          aria-expanded="false"
          aria-label="Open navigation menu"
          className="aero-dock-mobile-trigger aero-focus-ring inline-flex lg:hidden"
          onClick={() => setMobileOpen(true)}
          type="button"
        >
          <PanelLeftOpen aria-hidden="true" size={18} />
        </button>
      ) : null}

      {mobileOpen ? (
        <div className="aero-dock-mobile-overlay lg:hidden" onClick={() => setMobileOpen(false)} role="presentation">
          <aside
            aria-label="Mobile navigation drawer"
            className="aero-dock-mobile-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="aero-dock-brand">
              <div>
                <p className="aero-dock-brand-mark">GraphCognitio</p>
                <p className="aero-dock-brand-copy">Dock navigation</p>
              </div>
              <button
                aria-label="Close navigation menu"
                className="aero-dock-toggle aero-focus-ring"
                onClick={() => setMobileOpen(false)}
                type="button"
              >
                <PanelLeftClose aria-hidden="true" size={14} />
              </button>
            </div>

            <nav
              className="aero-dock-list"
              onPointerLeave={mobileDock.handlePointerLeave}
              onPointerMove={mobileDock.handlePointerMove}
            >
              {routeItems
                .filter((item) => item.requiresAuth)
                .map((item) => (
                  <AeroDockItem
                    key={`mobile:${item.route}`}
                    active={location.pathname === item.route}
                    collapsed={false}
                    icon={item.icon}
                    itemRef={mobileDock.registerItem(`mobile:${item.route}`)}
                    label={item.label}
                    onActivate={() => setMobileOpen(false)}
                    to={item.route}
                    tone={item.tone}
                  />
                ))}
            </nav>

            {dockActions.length > 0 ? <div className="aero-dock-divider" /> : null}

            {dockActions.length > 0 ? (
              <div
                className="aero-dock-list aero-dock-list--footer"
                onPointerLeave={mobileDock.handlePointerLeave}
                onPointerMove={mobileDock.handlePointerMove}
              >
                {dockActions.map((action) => (
                  <AeroDockItem
                    key={`mobile:${action.id}`}
                    collapsed={false}
                    icon={action.icon}
                    itemRef={mobileDock.registerItem(`mobile:action:${action.id}`)}
                    label={action.label}
                    onActivate={() => {
                      setMobileOpen(false);
                      action.onActivate();
                    }}
                    tone={action.tone}
                  />
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </>
  );
}
