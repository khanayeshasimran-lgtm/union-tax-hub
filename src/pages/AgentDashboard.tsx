import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Users, Phone, CalendarClock, DollarSign,
  TrendingUp, Briefcase, AlertTriangle, Trophy
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalLeads: 0,
    followUpsDue: 0,
    overdueFollowups: 0,
    openCases: 0,
    monthlyRevenue: 0,
    callsToday: 0,
    conversionRate: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [overdueList, setOverdueList] = useState<any[]>([]);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [leadsRes, followupsRes, dispositionsRes, revenueRes, lbRes] = await Promise.all([
        supabase.from("leads").select("*").eq("assigned_agent_id", user.id),
        supabase
          .from("followups")
          .select("*, leads(full_name, phone_number)")
          .eq("agent_id", user.id)
          .in("status", ["Upcoming", "Overdue"])
          .order("follow_up_datetime", { ascending: true }),
        supabase
          .from("call_dispositions")
          .select("*")
          .eq("agent_id", user.id)
          .gte("created_at", todayStr),
        supabase
          .from("revenue_entries")
          .select("amount_usd, payment_date")
          .eq("agent_id", user.id)
          .gte("payment_date", monthStart.split("T")[0]),
        supabase
          .from("leaderboard_metrics")
          .select("agent_id, monthly_revenue")
          .order("monthly_revenue", { ascending: false }),
      ]);

      const leads = leadsRes.data || [];
      const converted = leads.filter((l) => l.status === "Converted").length;
      const followups = followupsRes.data || [];
      const overdue = followups.filter((f) => f.status === "Overdue");
      const monthlyRev = (revenueRes.data || [])
        .reduce((s: number, r: any) => s + Number(r.amount_usd), 0);

      // Leaderboard rank
      const lb = lbRes.data || [];
      const rankIdx = lb.findIndex((r: any) => r.agent_id === user.id);
      setLeaderboardRank(rankIdx >= 0 ? rankIdx + 1 : null);

      setStats({
        totalLeads: leads.length,
        followUpsDue: followups.length,
        overdueFollowups: overdue.length,
        openCases: converted,
        monthlyRevenue: monthlyRev,
        callsToday: (dispositionsRes.data || []).length,
        conversionRate: leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0,
      });

      setOverdueList(overdue.slice(0, 5));
      setRecentLeads(leads.slice(0, 8));
    };

    fetchData();

    // Realtime: leads + followups + revenue
    const channel = supabase
      .channel("agent-realtime")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "leads",
        filter: `assigned_agent_id=eq.${user.id}`,
      }, fetchData)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "followups",
        filter: `agent_id=eq.${user.id}`,
      }, fetchData)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "revenue_entries",
        filter: `agent_id=eq.${user.id}`,
      }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="My Dashboard" description="Your daily overview" />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KpiCard title="My Leads" value={stats.totalLeads} icon={Users} />
        <KpiCard title="Calls Today" value={stats.callsToday} icon={Phone} />
        <KpiCard title="Follow-Ups Due" value={stats.followUpsDue} icon={CalendarClock} />
        <KpiCard title="Open Cases" value={stats.openCases} icon={Briefcase} />
        <KpiCard title="Revenue (MTD)" value={`$${stats.monthlyRevenue.toLocaleString()}`} icon={DollarSign} />
        <KpiCard title="Conversion Rate" value={`${stats.conversionRate}%`} icon={TrendingUp} />
        <KpiCard
          title="Overdue Follow-Ups"
          value={stats.overdueFollowups}
          icon={AlertTriangle}
        />
        <KpiCard
          title="Leaderboard Rank"
          value={leaderboardRank ? `#${leaderboardRank}` : "—"}
          icon={Trophy}
        />
      </div>

      {/* Overdue Alert */}
      {overdueList.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-sm font-semibold text-destructive">
              {overdueList.length} Overdue Follow-Up{overdueList.length > 1 ? "s" : ""}
            </h3>
          </div>
          <div className="space-y-2">
            {overdueList.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-md bg-background border px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {(f.leads as any)?.full_name || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Was due: {new Date(f.follow_up_datetime).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/follow-ups`)}
                  className="text-xs text-primary hover:underline"
                >
                  View →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Leads Table */}
      <div className="kpi-card">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Recent Leads</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Attempts</th>
                <th className="pb-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No leads assigned yet
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="data-table-row cursor-pointer"
                    onClick={() => navigate(`/calls?leadId=${lead.id}`)}
                  >
                    <td className="py-3 font-medium text-foreground">{lead.full_name}</td>
                    <td className="py-3 text-muted-foreground">{lead.phone_number}</td>
                    <td className="py-3"><StatusBadge status={lead.status} /></td>
                    <td className="py-3 text-muted-foreground">{lead.attempt_count}</td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}