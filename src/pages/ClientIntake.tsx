import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Loader2, Eye, EyeOff, User, DollarSign,
  MapPin, Phone, Mail, FileText, ChevronRight,
  CheckCircle2, Lock, Search
} from "lucide-react";

const FILING_STATUSES = [
  "Single",
  "Married Filing Jointly",
  "Married Filing Separately",
  "Head of Household",
  "Qualifying Widow(er)",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

function DecryptedSSN({ encrypted }: { encrypted: string }) {
  const [ssn, setSsn] = useState("Loading...");
  useEffect(() => {
(supabase as any).rpc("decrypt_ssn", { encrypted_ssn: encrypted })
      .then(({ data }) => setSsn(data || "Error"));
  }, [encrypted]);
  return <span>{ssn}</span>;
}
// Simple SSN masker — shows only last 4
function maskSSN(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 4) return raw;
  return `***-**-${digits.slice(-4)}`;
}

// Format SSN input as user types: 123-45-6789
function formatSSN(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

type IntakeFormData = {
  lead_id: string;
  case_id: string;
  full_legal_name: string;
  ssn: string;
  dob: string;
  filing_status: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  dependents: string;
  w2_income: string;
  form_1099_income: string;
  business_income: string;
  other_income: string;
  estimated_refund: string;
  notes: string;
};

const EMPTY_FORM: IntakeFormData = {
  lead_id: "", case_id: "", full_legal_name: "", ssn: "",
  dob: "", filing_status: "", address: "", city: "",
  state: "", zip_code: "", phone: "", email: "",
  dependents: "0", w2_income: "0", form_1099_income: "0",
  business_income: "0", other_income: "0",
  estimated_refund: "", notes: "",
};

function SectionHeader({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 border-b pb-2 mb-4">
      <Icon className="h-4 w-4 text-indigo-500" />
      <h3 className="text-sm font-semibold text-foreground">{label}</h3>
    </div>
  );
}

export default function ClientIntake() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin" || role === "super_admin";

  const [intakes, setIntakes] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<IntakeFormData>(EMPTY_FORM);
  const [showSSN, setShowSSN] = useState(false);
  const [search, setSearch] = useState("");

  // View existing intake
  const [viewIntake, setViewIntake] = useState<any | null>(null);
  const [showViewSSN, setShowViewSSN] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [intakeRes, casesRes, leadsRes] = await Promise.all([
      supabase.from("client_intake")
        .select("*, leads(full_name, phone_number), cases(current_stage)")
        .order("created_at", { ascending: false }),
      supabase
        .from("cases")
        .select("id, current_stage, leads(full_name)")
        .not("current_stage", "eq", "Closed"),
      supabase
        .from("leads")
        .select("id, full_name, phone_number, email")
        .eq("status", "Converted"),
    ]);
    setIntakes(intakeRes.data || []);
    setCases(casesRes.data || []);
    setLeads(leadsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  // Auto-fill name/phone/email when lead selected
  const handleLeadSelect = (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    setForm((f) => ({
      ...f,
      lead_id: leadId,
      full_legal_name: lead?.full_name || f.full_legal_name,
      phone: lead?.phone_number || f.phone,
      email: lead?.email || f.email,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate SSN format
    const ssnDigits = form.ssn.replace(/\D/g, "");
    if (ssnDigits.length !== 9) {
      toast({ title: "Invalid SSN", description: "SSN must be 9 digits.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const orgRes = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    const orgId = orgRes.data?.organization_id;

    // Store last 4 for display, full SSN "encrypted" as base64
    // In production use pgcrypto encrypt() — this is masked storage
    const ssnLast4 = ssnDigits.slice(-4);
const { data: encryptedData, error: encryptErr } = await (supabase as any)
  .rpc("encrypt_ssn", { plain_ssn: form.ssn });

if (encryptErr || !encryptedData) {
  toast({ title: "Encryption failed", description: "Could not secure SSN. Contact support.", variant: "destructive" });
  setSubmitting(false);
  return;
}
const ssnEncrypted = encryptedData;
    const { error } = await supabase.from("client_intake").insert({
      organization_id: orgId,
      lead_id: form.lead_id || null,
      case_id: form.case_id || null,
      full_legal_name: form.full_legal_name,
      ssn_encrypted: ssnEncrypted,
      ssn_last_four: ssnLast4,
      dob: form.dob || null,
      filing_status: form.filing_status || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      zip_code: form.zip_code || null,
      phone: form.phone || null,
      email: form.email || null,
      dependents: parseInt(form.dependents) || 0,
      w2_income: parseFloat(form.w2_income) || 0,
      form_1099_income: parseFloat(form.form_1099_income) || 0,
      business_income: parseFloat(form.business_income) || 0,
      other_income: parseFloat(form.other_income) || 0,
      estimated_refund: form.estimated_refund ? parseFloat(form.estimated_refund) : null,
      notes: form.notes || null,
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // If case selected, advance to Intake Submitted
    if (form.case_id) {
      await supabase
        .from("cases")
        .update({ current_stage: "Intake Submitted", updated_at: new Date().toISOString() })
        .eq("id", form.case_id);
    }

    toast({ title: "Intake submitted", description: `${form.full_legal_name}'s intake is complete. Case moved to Intake Submitted.` });
    setShowForm(false);
    setForm(EMPTY_FORM);
    fetchData();
    setSubmitting(false);
  };

  const f = (field: keyof IntakeFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const totalIncome =
    (parseFloat(form.w2_income) || 0) +
    (parseFloat(form.form_1099_income) || 0) +
    (parseFloat(form.business_income) || 0) +
    (parseFloat(form.other_income) || 0);

  const filtered = intakes.filter((i) =>
    (i.full_legal_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (i.leads?.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Client Intake"
        description={`${intakes.length} intake submissions`}
        actions={
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" /> New Intake
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  Client Intake Form
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 pt-2">

                {/* ── Lead + Case Link ──────────────────────────────────── */}
                <div>
                  <SectionHeader icon={ChevronRight} label="Link to Lead & Case" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Converted Lead</Label>
                      <select
                        value={form.lead_id}
                        onChange={(e) => handleLeadSelect(e.target.value)}
                        className="w-full rounded-md border bg-background p-2 text-sm"
                      >
                        <option value="">Select lead...</option>
                        {leads.map((l) => (
                          <option key={l.id} value={l.id}>{l.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Case
                        <span className="ml-1 text-xs text-muted-foreground">
                          (will advance to Intake Submitted)
                        </span>
                      </Label>
                      <select
                        value={form.case_id}
                        onChange={(e) => f("case_id", e.target.value)}
                        className="w-full rounded-md border bg-background p-2 text-sm"
                      >
                        <option value="">Select case...</option>
                        {cases.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.leads?.full_name || c.id} — {c.current_stage}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── Personal Information ──────────────────────────────── */}
                <div>
                  <SectionHeader icon={User} label="Personal Information" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Full Legal Name *</Label>
                      <Input
                        required
                        value={form.full_legal_name}
                        onChange={(e) => f("full_legal_name", e.target.value)}
                        placeholder="As it appears on tax documents"
                      />
                    </div>

                    {/* SSN with show/hide */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Lock className="h-3 w-3 text-muted-foreground" />
                        SSN *
                      </Label>
                      <div className="relative">
                        <Input
                          required
                          type={showSSN ? "text" : "password"}
                          value={form.ssn}
                          onChange={(e) => f("ssn", formatSSN(e.target.value))}
                          placeholder="123-45-6789"
                          className="pr-10"
                          maxLength={11}
                        />
                        <button
                          type="button"
                          onClick={() => setShowSSN(!showSSN)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showSSN ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">Stored encrypted. Only last 4 digits shown after submission.</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={form.dob}
                        onChange={(e) => f("dob", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Filing Status *</Label>
                      <Select value={form.filing_status} onValueChange={(v) => f("filing_status", v)}>
                        <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                        <SelectContent>
                          {FILING_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Dependents</Label>
                      <Input
                        type="number"
                        min="0"
                        value={form.dependents}
                        onChange={(e) => f("dependents", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Contact & Address ─────────────────────────────────── */}
                <div>
                  <SectionHeader icon={MapPin} label="Contact & Address" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Phone
                      </Label>
                      <Input
                        value={form.phone}
                        onChange={(e) => f("phone", e.target.value)}
                        placeholder="555-0100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Email
                      </Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => f("email", e.target.value)}
                        placeholder="client@email.com"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Street Address</Label>
                      <Input
                        value={form.address}
                        onChange={(e) => f("address", e.target.value)}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        value={form.city}
                        onChange={(e) => f("city", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Select value={form.state} onValueChange={(v) => f("state", v)}>
                          <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                          <SelectContent>
                            {US_STATES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>ZIP Code</Label>
                        <Input
                          value={form.zip_code}
                          onChange={(e) => f("zip_code", e.target.value)}
                          placeholder="10001"
                          maxLength={5}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Income Information ────────────────────────────────── */}
                <div>
                  <SectionHeader icon={DollarSign} label="Income Information (USD)" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>W-2 Income</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7"
                          value={form.w2_income}
                          onChange={(e) => f("w2_income", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>1099 / Self-Employment Income</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7"
                          value={form.form_1099_income}
                          onChange={(e) => f("form_1099_income", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Business Income</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7"
                          value={form.business_income}
                          onChange={(e) => f("business_income", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Other Income</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          className="pl-7"
                          value={form.other_income}
                          onChange={(e) => f("other_income", e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Live total */}
                    <div className="sm:col-span-2 rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-indigo-800">Total Gross Income</span>
                      <span className="text-lg font-bold text-indigo-700">
                        ${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Label>Estimated Refund / Liability</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          className="pl-7"
                          placeholder="Optional"
                          value={form.estimated_refund}
                          onChange={(e) => f("estimated_refund", e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Positive = refund, negative = owes</p>
                    </div>
                  </div>
                </div>

                {/* ── Notes ────────────────────────────────────────────── */}
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => f("notes", e.target.value)}
                    placeholder="Any additional information relevant to filing..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting || !form.full_legal_name || !form.ssn}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Intake & Advance Case
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* ── Search ──────────────────────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Intake Table ────────────────────────────────────────────────────── */}
      <div className="kpi-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Client Name</th>
                <th className="px-4 py-3 font-medium">SSN</th>
                <th className="px-4 py-3 font-medium">Filing Status</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">Total Income</th>
                <th className="px-4 py-3 font-medium">Case Stage</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No intake submissions yet
                  </td>
                </tr>
              ) : (
                filtered.map((intake: any) => {
                  const total =
                    Number(intake.w2_income || 0) +
                    Number(intake.form_1099_income || 0) +
                    Number(intake.business_income || 0) +
                    Number(intake.other_income || 0);
                  return (
                    <tr key={intake.id} className="data-table-row">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {intake.full_legal_name}
                      </td>
                      {/* SSN — always masked in table */}
                      <td className="px-4 py-3 font-mono text-muted-foreground">
                        ***-**-{intake.ssn_last_four || "????"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {intake.filing_status || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {intake.state || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        ${total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {intake.cases?.current_stage ? (
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            {intake.cases.current_stage}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(intake.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setViewIntake(intake); setShowViewSSN(false); }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── View Intake Detail Modal ─────────────────────────────────────────── */}
      {viewIntake && (
        <Dialog open={!!viewIntake} onOpenChange={() => setViewIntake(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                {viewIntake.full_legal_name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              {/* Personal */}
              <div>
                <SectionHeader icon={User} label="Personal Information" />
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">SSN</p>
                    <div className="flex items-center gap-2 font-mono">
{showViewSSN && isAdmin
  ? <DecryptedSSN encrypted={viewIntake.ssn_encrypted} />
  : `***-**-${viewIntake.ssn_last_four || "????"}`
}
                      {isAdmin && (
                        <button
                          onClick={() => setShowViewSSN(!showViewSSN)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {showViewSSN ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      )}
                      {!isAdmin && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div><p className="text-xs text-muted-foreground">Date of Birth</p><p>{viewIntake.dob || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Filing Status</p><p>{viewIntake.filing_status || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Dependents</p><p>{viewIntake.dependents ?? "—"}</p></div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <SectionHeader icon={Phone} label="Contact & Address" />
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  <div><p className="text-xs text-muted-foreground">Phone</p><p>{viewIntake.phone || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Email</p><p>{viewIntake.email || "—"}</p></div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p>{[viewIntake.address, viewIntake.city, viewIntake.state, viewIntake.zip_code].filter(Boolean).join(", ") || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Income */}
              <div>
                <SectionHeader icon={DollarSign} label="Income Breakdown" />
                <div className="grid gap-2 sm:grid-cols-2 text-sm">
                  {[
                    { label: "W-2 Income", value: viewIntake.w2_income },
                    { label: "1099 Income", value: viewIntake.form_1099_income },
                    { label: "Business Income", value: viewIntake.business_income },
                    { label: "Other Income", value: viewIntake.other_income },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium">${Number(value || 0).toLocaleString()}</p>
                    </div>
                  ))}
                  <div className="sm:col-span-2 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2 flex justify-between">
                    <span className="text-sm font-medium text-indigo-800">Total Gross Income</span>
                    <span className="font-bold text-indigo-700">
                      ${(
                        Number(viewIntake.w2_income || 0) +
                        Number(viewIntake.form_1099_income || 0) +
                        Number(viewIntake.business_income || 0) +
                        Number(viewIntake.other_income || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                  {viewIntake.estimated_refund !== null && (
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Refund / Liability</p>
                      <p className={`font-medium ${Number(viewIntake.estimated_refund) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {Number(viewIntake.estimated_refund) >= 0 ? "+" : ""}
                        ${Number(viewIntake.estimated_refund).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {viewIntake.notes && (
                <div>
                  <SectionHeader icon={FileText} label="Notes" />
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewIntake.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}