import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Upload, CheckCircle2, XCircle, Clock,
  AlertTriangle, FileText, User, Shield, Briefcase,
  ChevronDown, ChevronUp, Plus, Download
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DocStatus = "uploaded" | "under_review" | "approved" | "rejected";
type OwnerRole = "agent" | "client" | "admin" | "system";

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; icon: any }> = {
  uploaded:     { label: "Uploaded",      color: "bg-blue-100 text-blue-700",     icon: Clock },
  under_review: { label: "Under Review",  color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved:     { label: "Approved",      color: "bg-green-100 text-green-700",   icon: CheckCircle2 },
  rejected:     { label: "Rejected",      color: "bg-red-100 text-red-700",       icon: XCircle },
};

const OWNER_CONFIG: Record<OwnerRole, { label: string; icon: any; color: string }> = {
  agent:  { label: "Agent",  icon: User,      color: "text-blue-500" },
  client: { label: "Client", icon: Briefcase, color: "text-purple-500" },
  admin:  { label: "Admin",  icon: Shield,    color: "text-red-500" },
  system: { label: "System", icon: FileText,  color: "text-gray-500" },
};

function DocStatusBadge({ status }: { status: DocStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.uploaded;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

function OwnerBadge({ role }: { role: OwnerRole }) {
  const cfg = OWNER_CONFIG[role] || OWNER_CONFIG.agent;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${cfg.color}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

export default function Documents() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin" || role === "super_admin";

  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [requiredDocs, setRequiredDocs] = useState<any[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [showAddReq, setShowAddReq] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [addingDoc, setAddingDoc] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Track mounted state to prevent memory leaks
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ──────────────────────────────────────────────────────────────────────────────
  // FIX #1: Extract org lookup to separate function with proper error handling
  // ──────────────────────────────────────────────────────────────────────────────
  const getOrgId = async (): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated.",
        variant: "destructive"
      });
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    // FIX: Properly check for error and missing data
    if (error) {
      toast({
        title: "Error retrieving organization",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }

    if (!data || !data.organization_id) {
      toast({
        title: "Error",
        description: "No organization associated with your account.",
        variant: "destructive"
      });
      return null;
    }

    return data.organization_id;
  };

  // ── Load cases ───────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from("cases")
      .select("id, leads(full_name), current_stage")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (isMountedRef.current) {
          setCases(data || []);
        }
      });
  }, []);

  // ── Fetch docs for selected case ─────────────────────────────────────────────
  const fetchDocuments = async () => {
    if (!selectedCase) {
      setRequiredDocs([]);
      setUploadedDocs([]);
      return;
    }
    setLoading(true);
    try {
      const [{ data: req, error: reqErr }, { data: up, error: upErr }] = await Promise.all([
        supabase.from("required_documents")
          .select("*")
          .eq("case_id", selectedCase),
        supabase.from("case_documents")
          .select("*, profiles:uploaded_by(full_name)")
          .eq("case_id", selectedCase)
          .order("created_at", { ascending: false }),
      ]);

      if (reqErr || upErr) {
        toast({
          title: "Error loading documents",
          description: reqErr?.message || upErr?.message || "Unknown error",
          variant: "destructive",
        });
      }

      if (isMountedRef.current) {
        setRequiredDocs(req || []);
        setUploadedDocs(up || []);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => { fetchDocuments(); }, [selectedCase]);

  // ──────────────────────────────────────────────────────────────────────────────
  // FIX #2 & #3 & #4: Improved upload with proper error handling and cleanup
  // ──────────────────────────────────────────────────────────────────────────────
  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    reqDocId?: string
  ) => {
    if (!selectedCase || !user) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      // Get org ID with proper error handling
      const orgId = await getOrgId();
      if (!orgId) {
        setUploading(false);
        return;
      }

      const path = `${orgId}/${selectedCase}/${Date.now()}_${file.name}`;

      // Step 1: Upload to storage
      const { error: storageErr } = await supabase.storage
        .from("client-documents")
        .upload(path, file);

      if (storageErr) {
        toast({
          title: "Upload failed",
          description: storageErr.message,
          variant: "destructive"
        });
        setUploading(false);
        return;
      }

      // Step 2: Insert into database
      // Schema requires: file_name, file_path, and organization_id
      const { error: dbErr } = await supabase.from("case_documents").insert({
        file_name: file.name,                // ✅ REQUIRED - primary file identifier
        file_path: path,                     // ✅ REQUIRED - storage bucket path
        organization_id: orgId,              // ✅ REQUIRED - multi-tenancy
        case_id: selectedCase,
        uploaded_by: user.id,
        document_name: file.name,            // Optional - for UI display
        document_type: file.type,
        status: "uploaded",
        is_required: !!reqDocId,
        required_document_id: reqDocId || null,
        owner_role: isAdmin ? "admin" : "agent",
      });

      if (dbErr) {
        // FIX #4: Clean up orphaned file from storage if DB insert fails
        await supabase.storage
          .from("client-documents")
          .remove([path]);

        toast({
          title: "Database error",
          description: dbErr.message,
          variant: "destructive"
        });
        setUploading(false);
        return;
      }

      toast({
        title: "File uploaded successfully",
        description: file.name
      });

      await fetchDocuments();

      // Clear file input properly using ref
      e.target.value = "";
    } finally {
      if (isMountedRef.current) {
        setUploading(false);
      }
    }
  };

  // ── Download via signed URL ──────────────────────────────────────────────────
  const handleDownload = async (doc: any) => {
    const path = doc.storage_path || doc.file_path;
    if (!path) {
      toast({
        title: "No file path",
        description: "This document has no storage path attached.",
        variant: "destructive",
      });
      return;
    }

    setDownloading(doc.id);

    try {
      const { data, error } = await supabase.storage
        .from("client-documents")
        .createSignedUrl(path, 60);

      if (error || !data?.signedUrl) {
        toast({
          title: "Download failed",
          description: error?.message || "Could not generate download link.",
          variant: "destructive",
        });
        return;
      }

      window.open(data.signedUrl, "_blank");
      toast({
        title: "Opening file",
        description: doc.document_name || doc.file_name || "File",
      });
    } finally {
      if (isMountedRef.current) {
        setDownloading(null);
      }
    }
  };

  // ── Update doc status (admin only) ──────────────────────────────────────────
  const updateStatus = async (docId: string, status: DocStatus) => {
    setUpdatingStatus(docId);
    try {
      const { error } = await supabase.from("case_documents")
        .update({ status })
        .eq("id", docId);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({ title: `Document marked ${status}` });
        await fetchDocuments();
      }
    } finally {
      if (isMountedRef.current) {
        setUpdatingStatus(null);
      }
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // FIX #1 (part 2): Improved add required document with error handling
  // ──────────────────────────────────────────────────────────────────────────────
  const handleAddRequired = async () => {
    if (!newDocName.trim() || !selectedCase || !user) return;
    setAddingDoc(true);

    try {
      // Get org ID with proper error handling
      const orgId = await getOrgId();
      if (!orgId) {
        setAddingDoc(false);
        return;
      }

      const { error } = await supabase.from("required_documents").insert({
        case_id: selectedCase,
        organization_id: orgId,
        document_name: newDocName.trim(),
        is_required: true,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({ title: "Required document added" });
        setNewDocName("");
        setShowAddReq(false);
        await fetchDocuments();
      }
    } finally {
      if (isMountedRef.current) {
        setAddingDoc(false);
      }
    }
  };

  // ── Derived state ────────────────────────────────────────────────────────────
  const approvedDocIds = new Set(
    uploadedDocs
      .filter((d) => d.status === "approved" && d.required_document_id)
      .map((d) => d.required_document_id)
  );
  const missingDocs = requiredDocs.filter((rd) => !approvedDocIds.has(rd.id));
  const missingCount = missingDocs.length;
  const totalRequired = requiredDocs.length;
  const completionPct =
    totalRequired > 0
      ? Math.round(((totalRequired - missingCount) / totalRequired) * 100)
      : 0;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Document Center" description="Full document pipeline per case" />

      {/* ── Case Selector + Progress ─────────────────────────────────────────── */}
      <div className="kpi-card space-y-3">
        <label className="text-sm font-semibold">Select Case</label>
        <select
          value={selectedCase}
          onChange={(e) => setSelectedCase(e.target.value)}
          className="w-full rounded-md border bg-background p-2 text-sm"
        >
          <option value="">Choose a case...</option>
          {cases.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.leads?.full_name || "Unknown"} — {c.current_stage}
            </option>
          ))}
        </select>

        {selectedCase && totalRequired > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {totalRequired - missingCount} of {totalRequired} required docs received
              </span>
              <span className="font-semibold text-foreground">{completionPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  completionPct === 100 ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Missing Docs Alert ───────────────────────────────────────────────── */}
      {selectedCase && missingCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              {missingCount} document{missingCount > 1 ? "s" : ""} missing
            </p>
            <ul className="mt-1 space-y-0.5">
              {missingDocs.map((d) => (
                <li key={d.id} className="text-xs text-yellow-700">• {d.document_name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── All Clear Banner ─────────────────────────────────────────────────── */}
      {selectedCase && missingCount === 0 && totalRequired > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm font-semibold text-green-800">
            All required documents received — case can progress
          </p>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {!selectedCase ? (
        <div className="kpi-card flex flex-col items-center justify-center py-16">
          <FileText className="mb-3 h-10 w-10 opacity-30 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a case to manage documents</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">

          {/* ── Required Documents Checklist ─────────────────────────────── */}
          <div className="kpi-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Required Documents</h3>
              {isAdmin && (
                <Dialog open={showAddReq} onOpenChange={setShowAddReq}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="mr-1 h-3 w-3" /> Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Required Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Document Name</Label>
                        <Input
                          value={newDocName}
                          onChange={(e) => setNewDocName(e.target.value)}
                          placeholder="e.g. W-2 Form 2024"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddRequired();
                          }}
                          disabled={addingDoc}
                        />
                      </div>
                      <Button
                        onClick={handleAddRequired}
                        disabled={addingDoc || !newDocName.trim()}
                        className="w-full"
                      >
                        {addingDoc && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {requiredDocs.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No required documents defined
                {isAdmin && " — click Add to create one"}
              </p>
            ) : (
              requiredDocs.map((doc: any) => {
                const isReceived = approvedDocIds.has(doc.id);
                const matched = uploadedDocs.find(
                  (u) => u.required_document_id === doc.id
                );
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      isReceived
                        ? "border-green-200 bg-green-50"
                        : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isReceived ? (
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.document_name}</p>
                        {matched && (
                          <p className="text-xs text-muted-foreground truncate">
                            {matched.document_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      {matched && <DocStatusBadge status={matched.status} />}
                      {matched && (
                        <button
                          onClick={() => handleDownload(matched)}
                          disabled={downloading === matched.id}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                          title="Download file"
                          aria-label="Download document"
                        >
                          {downloading === matched.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Download className="h-3 w-3" />}
                        </button>
                      )}
                      {!isReceived && (
                        <label className="cursor-pointer inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors disabled:opacity-50"
                          aria-label="Upload required document">
                          {uploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Upload className="h-3 w-3" />
                          )}
                          Upload
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleUpload(e, doc.id)}
                            disabled={uploading}
                            aria-label={`Upload ${doc.document_name}`}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── All Uploaded Documents ───────────────────────────────────── */}
          <div className="kpi-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                All Uploads ({uploadedDocs.length})
              </h3>
              <label
                className={`inline-flex items-center gap-1 cursor-pointer rounded-md border px-2 py-1 text-xs hover:bg-muted transition-colors ${
                  uploading ? "opacity-50 pointer-events-none" : ""
                }`}
                aria-label="Upload new document"
              >
                {uploading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                Upload New
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleUpload(e)}
                  disabled={uploading}
                  aria-label="Upload new document file"
                />
              </label>
            </div>

            {uploadedDocs.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No files uploaded yet
              </p>
            ) : (
              uploadedDocs.map((doc: any) => (
                <div
                  key={doc.id}
                  className="rounded-lg border border-border bg-muted/10"
                >
                  {/* ── Collapsed row ── */}
                  <button
                    className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/5 transition-colors"
                    onClick={() =>
                      setExpandedDoc(expandedDoc === doc.id ? null : doc.id)
                    }
                    aria-expanded={expandedDoc === doc.id}
                    aria-label={`${expandedDoc === doc.id ? 'Collapse' : 'Expand'} ${doc.document_name || doc.file_name}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-medium">
                        {doc.document_name || doc.file_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <DocStatusBadge status={doc.status} />
                      {expandedDoc === doc.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {/* ── Expanded row ── */}
                  {expandedDoc === doc.id && (
                    <div className="border-t px-3 py-3 space-y-3">

                      {/* Meta row */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          By:{" "}
                          <span className="font-medium text-foreground">
                            {doc.profiles?.full_name || "—"}
                          </span>
                        </span>
                        <OwnerBadge role={doc.owner_role || doc.owner_type || "agent"} />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleString()}
                      </p>

                      {/* ── Download button ── */}
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={downloading === doc.id}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                        aria-label="Download or view file"
                      >
                        {downloading === doc.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        {downloading === doc.id ? "Generating link..." : "Download / View File"}
                      </button>

                      {/* ── Admin action buttons ── */}
                      {isAdmin && doc.status !== "approved" && (
                        <div className="flex gap-2 pt-1 flex-wrap">
                          {doc.status === "uploaded" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7"
                              onClick={() => updateStatus(doc.id, "under_review")}
                              disabled={updatingStatus === doc.id}
                            >
                              {updatingStatus === doc.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                              Mark Under Review
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="text-xs h-7 bg-green-600 hover:bg-green-700"
                            onClick={() => updateStatus(doc.id, "approved")}
                            disabled={updatingStatus === doc.id}
                          >
                            {updatingStatus === doc.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs h-7"
                            onClick={() => updateStatus(doc.id, "rejected")}
                            disabled={updatingStatus === doc.id}
                          >
                            {updatingStatus === doc.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                            <XCircle className="mr-1 h-3 w-3" /> Reject
                          </Button>
                        </div>
                      )}

                      {/* Re-open rejected */}
                      {doc.status === "rejected" && isAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => updateStatus(doc.id, "uploaded")}
                          disabled={updatingStatus === doc.id}
                        >
                          {updatingStatus === doc.id && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                          Re-open
                        </Button>
                      )}

                      {/* Non-admin status message */}
                      {!isAdmin && (
                        <p className="text-xs text-muted-foreground">
                          {doc.status === "rejected"
                            ? "This document was rejected. Please re-upload a corrected version."
                            : doc.status === "under_review"
                            ? "This document is under review by an admin."
                            : doc.status === "approved"
                            ? "This document has been approved."
                            : "Awaiting admin review."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}