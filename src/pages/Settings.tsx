import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon, Loader2, Save,
  RefreshCw, Shield, Users, Building2
} from "lucide-react";

export default function SettingsPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin" || role === "super_admin";

  // ── All state at the top ─────────────────────────────────────────────────────
  const [settings, setSettings] = useState({
    retry_gap_days: 7,
    max_attempt_limit: 3,
    leaderboard_reset_day: 1,
  });
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [rotationResult, setRotationResult] = useState<any[] | null>(null);
  const [orgName, setOrgName] = useState("");
  const [profile, setProfile] = useState<any>(null);

  // ── Fetch profile + settings ─────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      const [profRes, settingsRes] = await Promise.all([
        supabase.from("profiles").select("*, organizations(name)").eq("id", user.id).single(),
        supabase.from("system_settings").select("*").single(),
      ]);
      if (profRes.data) {
        setProfile(profRes.data);
        setOrgName(profRes.data?.organizations?.name || "");
      }
      if (settingsRes.data) {
        setSettingsId(settingsRes.data.id);
        setSettings({
          retry_gap_days: settingsRes.data.retry_gap_days,
          max_attempt_limit: settingsRes.data.max_attempt_limit,
          leaderboard_reset_day: settingsRes.data.leaderboard_reset_day,
        });
      }
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  // ── Save system settings ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!settingsId || !isAdmin) return;
    setSaving(true);
    const { error } = await supabase
      .from("system_settings")
      .update(settings)
      .eq("id", settingsId);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved" });
    }
    setSaving(false);
  };

  // ── Manual rotation trigger ──────────────────────────────────────────────────
  const handleManualRotation = async () => {
    setRotating(true);
    setRotationResult(null);
    const { data, error } = await supabase.rpc("rotate_not_answered_leads");
    if (error) {
      toast({ title: "Rotation failed", description: error.message, variant: "destructive" });
    } else {
      const results = data || [];
      setRotationResult(results);
      toast({
        title: "Rotation complete",
        description: results.length > 0
          ? `${results.length} lead(s) reassigned`
          : "No leads were due for rotation",
      });
    }
    setRotating(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <PageHeader title="Settings" description="System configuration" />

      {/* ── Profile Info (read-only) ─────────────────────────────────────────── */}
      <div className="kpi-card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Your Profile</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Full Name</Label>
            <p className="text-sm font-medium text-foreground">{profile?.full_name || "—"}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Role</Label>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">
              {profile?.role || "—"}
            </span>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Department</Label>
            <p className="text-sm text-foreground capitalize">{profile?.department || "Not set"}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Organization</Label>
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm text-foreground">{orgName || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── System Settings (admin only) ─────────────────────────────────────── */}
      {isAdmin ? (
        <>
          {/* Settings card */}
          <div className="kpi-card space-y-5">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">System Settings</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retry_gap">
                Retry Gap (days)
                <span className="ml-2 text-xs text-muted-foreground">
                  — Days before a "Not Answered" lead re-enters the queue
                </span>
              </Label>
              <Input
                id="retry_gap"
                type="number"
                min={1}
                max={30}
                value={settings.retry_gap_days}
                onChange={(e) =>
                  setSettings({ ...settings, retry_gap_days: parseInt(e.target.value) || 7 })
                }
                className="w-32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_attempts">
                Max Attempt Limit
                <span className="ml-2 text-xs text-muted-foreground">
                  — Max calls before a lead is retired from rotation
                </span>
              </Label>
              <Input
                id="max_attempts"
                type="number"
                min={1}
                max={10}
                value={settings.max_attempt_limit}
                onChange={(e) =>
                  setSettings({ ...settings, max_attempt_limit: parseInt(e.target.value) || 3 })
                }
                className="w-32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lb_reset">
                Leaderboard Reset Day
                <span className="ml-2 text-xs text-muted-foreground">
                  — Day of month to reset monthly leaderboard (1–28)
                </span>
              </Label>
              <Input
                id="lb_reset"
                type="number"
                min={1}
                max={28}
                value={settings.leaderboard_reset_day}
                onChange={(e) =>
                  setSettings({ ...settings, leaderboard_reset_day: parseInt(e.target.value) || 1 })
                }
                className="w-32"
              />
            </div>

            {/* Save + Reset — separate row, no nesting */}
            <div className="pt-2 border-t flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Save className="mr-2 h-4 w-4" />}
                Save Settings
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setSettings({ retry_gap_days: 7, max_attempt_limit: 3, leaderboard_reset_day: 1 })
                }
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Defaults
              </Button>
            </div>
          </div>

          {/* ── Rotation Engine card — separate from settings card ── */}
          <div className="kpi-card space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Lead Rotation Engine</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Manually trigger the 7-day rotation. Reassigns all "Not Answered" leads
              whose retry date has passed to a different agent with load balancing.
            </p>
            <Button
              variant="outline"
              onClick={handleManualRotation}
              disabled={rotating}
            >
              {rotating
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <RefreshCw className="mr-2 h-4 w-4" />}
              Run Rotation Now
            </Button>

            {/* Results */}
            {rotationResult !== null && (
              <div className="rounded-lg border overflow-hidden">
                {rotationResult.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-muted-foreground">
                    No leads were due for rotation.
                  </p>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-muted/30 border-b">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Lead</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rotationResult.map((r: any, i: number) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-3 py-2 font-medium">{r.lead_name}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              r.action === "rotated"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {r.action === "rotated" ? "Reassigned" : "Closed — no agents"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="kpi-card flex items-center gap-3 py-8 justify-center">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            System settings are only accessible to admins.
          </p>
        </div>
      )}
    </div>
  );
}