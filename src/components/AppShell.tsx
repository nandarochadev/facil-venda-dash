import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, Package, History, BarChart3, Settings, Bike } from "lucide-react";

const nav = [
  { to: "/pdv", label: "PDV", icon: ShoppingBag },
  { to: "/ifood", label: "iFood", icon: Bike },
  { to: "/estoque", label: "Estoque", icon: Package },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

export function AppShell() {
  const { location } = useRouterState();
  return (
    <div className="min-h-screen flex bg-surface p-3 gap-3">
      <aside className="w-56 shrink-0 bg-sidebar text-sidebar-foreground rounded-xl flex flex-col overflow-hidden">
        <div className="px-5 py-5 border-b border-white/10">
          <h1 className="text-xl font-semibold tracking-tight">VendaFácil</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-white/5"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 text-xs text-white/40">v1.0</div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
