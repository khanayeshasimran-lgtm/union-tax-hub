import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Loader2, Briefcase, FileText, CheckCircle2, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const STAGE_ORDER = [
  "Converted", "File Received", "Intake Submitted",
  "Estimation Approved", "Filing In Progress", "Filed", "Closed",
];

const STAGE_COLORS: Record<string, string> = {
  "Converted":           "bg-gray-100 text-gray-600",
  "File Received":       "bg-blue-100 text-blue-700",
  "Intake Submitted":    "bg-yellow-100 text-yellow-700",
  "Estimation Approved": "bg-indigo-100 text-indigo-700",
  "Filing In Progress":  "bg-orange-100 text-orange-700",
  "Filed":               "bg-green-100 text-green-700",
  "Closed":              "bg-emerald-100 text-emerald-700",
};

function StageProgress({ currentStage }: { currentStage: string }) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Case Progress</span>
        <span>{currentIndex + 1} of {STAGE_ORDER.length} stages</span>
      </div>
      <div className="flex gap-1">
        {STAGE_ORDER.map((stage, i) => (
          <div
            key={stage}
            title={stage}
            className={`h-2 flex-1 rounded-full transition-all ${
              i < currentIndex
                ? "bg-green-400"
                : i === currentIndex
                ? "bg-indigo-500"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Current: <span className="font-medium text-foreground">{currentStage}</span>
      </p>
    </div>
  );
}

export default function ClientPortal() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [cases, setCases] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchCases = async () => {
    if (!user) return;
    setLoading(true);

    const { data } = await supabase
      .from("cases")
      .select("*, leads(full_name, phone_number, email)")
      .order("created_at", { ascending: false });

    setCases(data || []);
    if (data && data.length > 0) setSelectedCase(data[0]);
    setLoading(false);
  };

  const fetchDocuments = async (caseId: string) => {
    const { data } = await (supabase.from("case_documents") as any)
      .select("*")
      .eq("case_id", caseId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    setDocuments(data || []);
  };

  useEffect(() => { fetchCases(); }, [user]);

  useEffect(() => {
    if (selectedCase) fetchDocuments(selectedCase.id);
  }, [selectedCase]);

  const handleDownload = async (doc: any) => {
    const path = doc.storage_path || doc.file_path;
    if (!path) return;
    setDownloading(doc.id);

    const { data, error } = await supabase.storage
      .from("client-documents")
      .createSignedUrl(path, 60);

    if (error || !data?.signedUrl) {
      toast({ title: "Download failed", variant: "destructive" });
      setDownloading(null);
      return;
    }

    window.open(data.signedUrl, "_blank");
    setDownloading(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="p-6">
        <PageHeader title="My Case" description="Track your tax filing status" />
        <div className="kpi-card flex flex-col items-center justify-center py-20">
          <Briefcase className="h-12 w-12 text-muted-foreground opacity-30 mb-3" />
          <p className="text-sm text-muted-foreground">No active cases found.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Contact your tax agent to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Case"
        description="Track your tax filing progress"
      />

      {/* ── Case selector if multiple ──────────────────────────────────────── */}
      {cases.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {cases.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setSelectedCase(c)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCase?.id === c.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-muted"
              }`}
            >
              {c.leads?.full_name || "Case"} — {c.current_stage}
            </button>
          ))}
        </div>
      )}

      {selectedCase && (
        <div className="grid gap-6 lg:grid-cols-2">

          {/* ── Case Status Card ─────────────────────────────────────────── */}
          <div className="kpi-card space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Case Status</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                STAGE_COLORS[selectedCase.current_stage] || "bg-muted text-muted-foreground"
              }`}>
                {selectedCase.current_stage}
              </span>
            </div>

            <StageProgress currentStage={selectedCase.current_stage} />

            <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Client Name</p>
                <p className="font-medium">{selectedCase.leads?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{selectedCase.leads?.phone_number || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-xs">{selectedCase.leads?.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Case Opened</p>
                <p className="font-medium">
                  {new Date(selectedCase.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* ── What's Next Card ─────────────────────────────────────────── */}
          <div className="kpi-card space-y-4">
            <h3 className="text-sm font-semibold text-foreground">What Happens Next</h3>
            <div className="space-y-3">
              {STAGE_ORDER.map((stage, i) => {
                const currentIndex = STAGE_ORDER.indexOf(selectedCase.current_stage);
                const isDone = i < currentIndex;
                const isCurrent = i === currentIndex;
                return (
                  <div key={stage} className={`flex items-center gap-3 text-sm ${
                    isDone ? "text-green-600" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}>
                    {isDone
                      ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
                      : isCurrent
                      ? <Clock className="h-4 w-4 flex-shrink-0 text-indigo-500" />
                      : <div className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-muted" />
                    }
                    {stage}
                    {isCurrent && (
                      <span className="ml-auto text-xs text-indigo-500 font-medium">Current</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Documents Card ───────────────────────────────────────────── */}
          <div className="kpi-card space-y-3 lg:col-span-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Approved Documents ({documents.length})
            </h3>

            {documents.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No approved documents yet — your agent is processing your files.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                      <span className="truncate text-sm font-medium text-green-900">
                        {doc.document_name || doc.file_name}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 text-green-700 hover:text-green-900 ml-2 flex-shrink-0"
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc.id}
                    >
                      {downloading === doc.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Download className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}