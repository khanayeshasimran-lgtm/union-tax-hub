import {
  LayoutDashboard, Users, Phone, CalendarClock, Briefcase, DollarSign,
  Trophy, FileSearch, Settings, LogOut, Building2, ChevronLeft, FileText,
  ChevronRight, ClipboardList, ClipboardCheck, TrendingDown, Sparkles
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useState } from "react";

const agentMenu = [
  { label: "Dashboard",    icon: LayoutDashboard, to: "/",           end: true },
  { label: "My Leads",     icon: Users,           to: "/leads" },
  { label: "Call Queue",   icon: Phone,           to: "/calls" },
  { label: "Follow-Ups",   icon: CalendarClock,   to: "/followups" },
  { label: "My Cases",     icon: Briefcase,       to: "/cases" },
  { label: "Client Intake",icon: ClipboardList,   to: "/intake" },
  { label: "Revenue",      icon: DollarSign,      to: "/revenue" },
  { label: "Leaderboard",  icon: Trophy,          to: "/leaderboard" },
  { label: "Documents",    icon: FileText,        to: "/documents" },
];

const adminMenu = [
  { label: "Dashboard",    icon: LayoutDashboard, to: "/",           end: true },
  { label: "All Leads",    icon: Users,           to: "/leads" },
  { label: "Call Queue",   icon: Phone,           to: "/calls" },
  { label: "Follow-Ups",   icon: CalendarClock,   to: "/followups" },
  { label: "Cases",        icon: Briefcase,       to: "/cases" },
  { label: "Client Intake",icon: ClipboardList,   to: "/intake" },
  { label: "Estimations",  icon: ClipboardCheck,  to: "/estimations" },
  { label: "Revenue",      icon: DollarSign,      to: "/revenue" },
  { label: "Leaderboard",  icon: Trophy,          to: "/leaderboard" },
  { label: "Documents",    icon: FileText,        to: "/documents" },
  { label: "Rejections",   icon: TrendingDown,    to: "/rejections" },
  { label: "Audit Trail",  icon: FileSearch,      to: "/audit" },
  { label: "Settings",     icon: Settings,        to: "/settings" },
];

const clientMenu = [
  { label: "My Case", icon: Briefcase, to: "/portal" },
];

const ROLE_LABEL: Record<string, string> = {
  super_admin:   "Super Admin",
  admin:         "Admin",
  agent:         "Agent",
  tax_processor: "Tax Processor",
  client:        "Client",
};

const ROLE_GRADIENT: Record<string, { from: string; to: string }> = {
  super_admin:   { from: "from-amber-400", to: "to-orange-500" },
  admin:         { from: "from-blue-400", to: "to-emerald-600" },
  agent:         { from: "from-emerald-400", to: "to-teal-600" },
  tax_processor: { from: "from-cyan-400", to: "to-blue-600" },
  client:        { from: "from-pink-400", to: "to-rose-500" },
};

export function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menu = (role === "admin" || role === "super_admin")
    ? adminMenu
    : (role as string) === "client"
    ? clientMenu
    : agentMenu;

  const initials = profile?.full_name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  const roleGradient = ROLE_GRADIENT[role || "agent"] || ROLE_GRADIENT.agent;

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen transition-all duration-300 ease-in-out",
        "border-r border-gray-200",
        "bg-gradient-to-b from-slate-950 via-gray-900 to-slate-950",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/5 via-transparent to-emerald-950/5 pointer-events-none" />

      {/* ── Logo & Branding ──────────────────────────────────────────────────── */}
      <div className={cn(
        "relative z-10 flex h-[68px] items-center border-b border-gray-800 backdrop-blur-sm",
        collapsed ? "justify-center px-2" : "px-4 gap-3"
      )}>
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-xl blur-lg opacity-70" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-600 shadow-xl shadow-blue-500/40">
            <Building2 className="h-6 w-6 text-white" />
          </div>
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1">
              <p className="text-sm font-bold text-white tracking-tight">Union</p>
              <p className="text-sm font-light text-blue-200">Tax</p>
            </div>
            <p className="text-[9px] text-gray-400 tracking-widest uppercase mt-0.5">Platform</p>
          </div>
        )}

        <Sparkles className="absolute right-2 h-3 w-3 text-blue-400/40" />
      </div>

      {/* ── Collapse toggle ────────────────────────────────────────────────────── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-[82px] z-20",
          "flex h-6 w-6 items-center justify-center rounded-full",
          "bg-white border-2 border-gray-300 shadow-lg",
          "text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 hover:scale-110"
        )}
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3" />
          : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* ── Navigation ────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden py-4 px-2.5 space-y-1 scrollbar-none">
        {menu.map((item, idx) => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            end={"end" in item ? (item.end as boolean) : false}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center rounded-lg transition-all duration-200",
                collapsed ? "justify-center h-11 w-11 mx-auto" : "gap-3 px-3.5 h-10",
                isActive
                  ? "bg-gradient-to-r from-blue-600/30 to-emerald-600/30 border border-blue-500/50 text-blue-100 shadow-lg shadow-blue-600/20"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-gradient-to-b from-blue-400 to-emerald-500 shadow-lg shadow-blue-500/60" />
                )}
                <div className={cn(
                  "relative transition-all duration-200",
                  isActive ? "text-blue-300" : "text-gray-500 group-hover:text-gray-300"
                )}>
                  <item.icon className={cn(
                    "transition-all duration-200",
                    collapsed ? "h-5 w-5" : "h-4 w-4",
                  )} />
                </div>
                {!collapsed && (
                  <span className={cn(
                    "text-sm font-medium tracking-tight transition-colors duration-200",
                    isActive ? "text-white font-semibold" : "text-gray-400"
                  )}>
                    {item.label}
                  </span>
                )}
                {collapsed && (
                  <span className={cn(
                    "pointer-events-none absolute left-full ml-3 z-50",
                    "whitespace-nowrap rounded-lg bg-gradient-to-r from-gray-800 to-slate-900 border border-gray-700",
                    "px-3 py-1.5 text-xs font-medium text-gray-100 shadow-xl backdrop-blur-sm",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  )}>
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-3 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

      {/* ── User Footer ───────────────────────────────────────────────────────── */}
      <div className={cn("relative z-10 p-3", collapsed ? "flex justify-center" : "")}>
        {collapsed ? (
          <button
            onClick={signOut}
            title="Sign out"
            className="group relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <div className="rounded-lg bg-gradient-to-r from-gray-800/50 to-gray-900/30 border border-gray-700 p-3 backdrop-blur-sm hover:border-gray-600 hover:from-gray-800/70 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                "bg-gradient-to-br text-white text-xs font-bold shadow-lg",
                `${roleGradient.from} ${roleGradient.to}`
              )}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold text-white leading-tight">
                  {profile?.full_name || "User"}
                </p>
                <p className={cn(
                  "text-[10px] font-medium tracking-wide mt-1",
                  "bg-gradient-to-r bg-clip-text text-transparent",
                  `${roleGradient.from} ${roleGradient.to}`
                )}>
                  {ROLE_LABEL[role || "agent"] || "Agent"}
                </p>
              </div>
              <button
                onClick={signOut}
                title="Sign out"
                className="rounded-md p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 transition-all duration-200"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}