import {
  LayoutDashboard, Users, Phone, CalendarClock, Briefcase, DollarSign,
  Trophy, FileSearch, Settings, LogOut, Building2, ChevronLeft, FileText,
  ChevronRight, ClipboardList, ClipboardCheck
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useState } from "react";

const agentMenu = [
  { label: "Dashboard",   icon: LayoutDashboard, to: "/",          end: true },
  { label: "My Leads",    icon: Users,            to: "/leads" },
  { label: "Call Queue",  icon: Phone,            to: "/calls" },
  { label: "Follow-Ups",  icon: CalendarClock,    to: "/followups" },
  { label: "My Cases",    icon: Briefcase,        to: "/cases" },
  { label: "Revenue",     icon: DollarSign,       to: "/revenue" },
  { label: "Leaderboard", icon: Trophy,           to: "/leaderboard" },
  { label: "Documents",   icon: FileText,         to: "/documents" },
  { label: "Client Intake", icon: ClipboardList, to: "/intake" },
  // Add to adminMenu (import ClipboardCheck from lucide-react)
{ label: "Estimations", icon: ClipboardCheck, to: "/estimations" },
];

const adminMenu = [
  { label: "Dashboard",   icon: LayoutDashboard, to: "/",          end: true },
  { label: "All Leads",   icon: Users,            to: "/leads" },
  { label: "Call Queue",  icon: Phone,            to: "/calls" },
  { label: "Follow-Ups",  icon: CalendarClock,    to: "/followups" },
  { label: "Cases",       icon: Briefcase,        to: "/cases" },
  { label: "Revenue",     icon: DollarSign,       to: "/revenue" },
  { label: "Leaderboard", icon: Trophy,           to: "/leaderboard" },
  { label: "Documents",   icon: FileText,         to: "/documents" },
  { label: "Audit Trail", icon: FileSearch,       to: "/audit" },
  { label: "Settings",    icon: Settings,         to: "/settings" },
  { label: "Client Intake", icon: ClipboardList, to: "/intake" },
  // Add to adminMenu (import ClipboardCheck from lucide-react)
{ label: "Estimations", icon: ClipboardCheck, to: "/estimations" },
];

const ROLE_LABEL: Record<string, string> = {
  super_admin:   "Super Admin",
  admin:         "Admin",
  agent:         "Agent",
  tax_processor: "Tax Processor",
  client:        "Client",
};

const ROLE_COLOR: Record<string, string> = {
  super_admin:   "from-amber-400 to-orange-400",
  admin:         "from-violet-400 to-indigo-400",
  agent:         "from-sky-400 to-cyan-400",
  tax_processor: "from-emerald-400 to-teal-400",
  client:        "from-pink-400 to-rose-400",
};

export function AppSidebar() {
  const { role, profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menu = role === "admin" || role === "super_admin" ? adminMenu : agentMenu;
  const initials = profile?.full_name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";
  const gradientClass = ROLE_COLOR[role || "agent"] || ROLE_COLOR.agent;

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-white/[0.06] transition-all duration-300 ease-in-out",
        "bg-[#0d1117]",
        collapsed ? "w-[68px]" : "w-[232px]"
      )}
      style={{
        backgroundImage: "radial-gradient(ellipse at 20% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)",
      }}
    >

      {/* ── Logo ─────────────────────────────────────────────────────────────── */}
      <div className={cn(
        "flex h-[60px] items-center border-b border-white/[0.06]",
        collapsed ? "justify-center px-0" : "px-4 gap-3"
      )}>
        <div className={cn(
          "flex items-center justify-center rounded-xl shrink-0",
          "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25",
          collapsed ? "h-8 w-8" : "h-8 w-8"
        )}>
          <Building2 className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-white tracking-wide leading-none">
              Union Tax
            </p>
            <p className="text-[10px] text-white/30 mt-0.5 tracking-widest uppercase">
              Operations
            </p>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ───────────────────────────────────────────────────── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-[72px] z-10",
          "flex h-6 w-6 items-center justify-center rounded-full",
          "bg-[#1c2333] border border-white/10 shadow-lg",
          "text-white/40 hover:text-white/80 transition-colors"
        )}
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3" />
          : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* ── Navigation ───────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-none">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center rounded-lg transition-all duration-150",
                collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-3 px-3 h-9",
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-indigo-400" />
                )}

                <item.icon className={cn(
                  "shrink-0 transition-all duration-150",
                  collapsed ? "h-[18px] w-[18px]" : "h-4 w-4",
                  isActive ? "text-indigo-400" : ""
                )} />

                {!collapsed && (
                  <span className={cn(
                    "text-[13px] font-medium tracking-tight truncate",
                    isActive ? "text-white" : ""
                  )}>
                    {item.label}
                  </span>
                )}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className={cn(
                    "pointer-events-none absolute left-full ml-3 z-50",
                    "whitespace-nowrap rounded-md bg-[#1c2333] border border-white/10",
                    "px-2.5 py-1.5 text-xs font-medium text-white shadow-xl",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-150"
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
      <div className="mx-3 h-px bg-white/[0.06]" />

      {/* ── User footer ───────────────────────────────────────────────────────── */}
      <div className={cn(
        "p-3",
        collapsed ? "flex justify-center" : ""
      )}>
        {collapsed ? (
          <button
            onClick={signOut}
            title="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] p-2">
            {/* Avatar */}
            <div className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              "bg-gradient-to-br text-white text-xs font-bold shadow-sm",
              gradientClass
            )}>
              {initials}
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-[12px] font-semibold text-white/90 leading-none mb-0.5">
                {profile?.full_name || "User"}
              </p>
              <p className={cn(
                "text-[10px] font-medium tracking-wide",
                "bg-gradient-to-r bg-clip-text text-transparent",
                gradientClass
              )}>
                {ROLE_LABEL[role || "agent"] || "Agent"}
              </p>
            </div>

            {/* Sign out */}
            <button
              onClick={signOut}
              title="Sign out"
              className="rounded-md p-1 text-white/20 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}