"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pill, LogOut, Plus, X, MessageCircle, Search, Clock, Calendar, UserPlus, Trash2 } from "lucide-react";
import { AdherepodLogo } from "@/components/adherepod-logo";
import Link from "next/link";
import MedicationCard from "@/components/medication-card";
import ClinicalNotes from "@/components/clinical-notes";
import ConversationHistory from "@/components/conversation-history";
import ProviderPatientCard from "@/components/provider-patient-card";

interface PatientLink {
  id: string;
  patientId: string;
  patientName: string | null;
  patientEmail: string;
  medicationCount: number;
  createdAt: string;
}

interface Medication {
  id: string;
  name: string;
  timesPerDay: number;
  timingDescription: string | null;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  reminderEnabled: boolean;
  reminderTimes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MedicationForm {
  name: string;
  timesPerDay: string;
  timingDescription: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const emptyForm: MedicationForm = {
  name: "",
  timesPerDay: "1",
  timingDescription: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  notes: "",
};

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

export default function ProviderDashboardPage() {
  const { data: session } = useSession();
  const [patients, setPatients] = useState<PatientLink[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"medications" | "conversations">("medications");

  // Add patient dialog state
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; name: string | null; email: string; alreadyAssigned?: boolean }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  // Medication state for selected patient
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medsLoading, setMedsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MedicationForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const currentUserRole = session?.user?.role === "user" ? "patient" : (session?.user?.role || "patient");

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch("/api/provider/patients");
      if (res.ok) {
        setPatients(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setPatientsLoading(false);
    }
  }, []);

  const fetchMedications = useCallback(async () => {
    if (!selectedPatientId) return;
    setMedsLoading(true);
    try {
      const res = await fetch(`/api/medications?patientId=${selectedPatientId}`);
      if (res.ok) {
        setMedications(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setMedsLoading(false);
    }
  }, [selectedPatientId]);

  const searchPatients = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/provider/patients/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Debounce patient search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showAddPatient) searchPatients(patientSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch, showAddPatient, searchPatients]);

  const assignPatient = async (patientId: string) => {
    setAssigning(patientId);
    try {
      const res = await fetch("/api/provider/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: session?.user?.id, patientId }),
      });
      if (res.ok) {
        fetchPatients();
        setSearchResults((prev) => prev.filter((p) => p.id !== patientId));
      }
    } catch {
      // silently fail
    } finally {
      setAssigning(null);
    }
  };

  const unassignPatient = async (linkId: string) => {
    if (!confirm("Remove this patient from your list?")) return;
    try {
      const res = await fetch(`/api/provider/patients?id=${linkId}`, { method: "DELETE" });
      if (res.ok) {
        fetchPatients();
        if (patients.find((p) => p.id === linkId)?.patientId === selectedPatientId) {
          setSelectedPatientId(null);
        }
      }
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchMedications();
      setShowForm(false);
      setEditingId(null);
    }
  }, [selectedPatientId, fetchMedications]);

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.patientName?.toLowerCase().includes(q) ?? false) ||
      p.patientEmail.toLowerCase().includes(q)
    );
  });

  const selectedPatient = patients.find((p) => p.patientId === selectedPatientId);

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (med: Medication) => {
    setForm({
      name: med.name,
      timesPerDay: String(med.timesPerDay),
      timingDescription: med.timingDescription || "",
      startDate: med.startDate.split("T")[0],
      endDate: med.endDate ? med.endDate.split("T")[0] : "",
      notes: med.notes || "",
    });
    setEditingId(med.id);
    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        ...(editingId ? { id: editingId } : { patientId: selectedPatientId }),
        name: form.name,
        timesPerDay: Number(form.timesPerDay),
        timingDescription: form.timingDescription || null,
        startDate: form.startDate,
        endDate: form.endDate || null,
        notes: form.notes || null,
      };

      const res = await fetch("/api/medications", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save medication");
        return;
      }

      closeForm();
      fetchMedications();
      fetchPatients(); // refresh medication counts
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medication?")) return;

    try {
      const res = await fetch(`/api/medications?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchMedications();
        fetchPatients();
      }
    } catch {
      // silently fail
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AdherepodLogo size={56} />
            <span className="text-xl font-bold">AdherePod</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
              Provider Dashboard
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                      {getInitials(session?.user?.name, session?.user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    {session?.user?.name && (
                      <p className="text-sm font-medium">{session.user.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 min-h-0 flex">
        {/* Left sidebar — Patient list */}
        <div className="w-72 shrink-0 border-r border-border flex flex-col bg-muted/30">
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                setShowAddPatient(true);
                setPatientSearch("");
                setSearchResults([]);
              }}
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              Add Patient
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {patientsLoading ? (
              <p className="text-sm text-muted-foreground p-3">Loading patients...</p>
            ) : filteredPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3">
                {patients.length === 0 ? "No patients assigned yet." : "No matching patients."}
              </p>
            ) : (
              filteredPatients.map((p) => (
                <div key={p.id} className="relative group">
                  <ProviderPatientCard
                    patientName={p.patientName}
                    patientEmail={p.patientEmail}
                    medicationCount={p.medicationCount}
                    isSelected={selectedPatientId === p.patientId}
                    onClick={() => setSelectedPatientId(p.patientId)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      unassignPatient(p.id);
                    }}
                    className="absolute top-2 right-2 hidden group-hover:flex items-center justify-center h-6 w-6 rounded bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
                    title="Remove patient"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Patient Dialog */}
        {showAddPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-[420px] max-h-[500px] flex flex-col">
              <CardHeader className="shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Add Patient</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddPatient(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 overflow-y-auto">
                {searchLoading ? (
                  <p className="text-sm text-muted-foreground">Searching...</p>
                ) : patientSearch.length < 1 ? (
                  <p className="text-sm text-muted-foreground">Type to search by name or email</p>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No patients found</p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 border border-border rounded-md"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.name || "Unnamed"}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                        </div>
                        {p.alreadyAssigned ? (
                          <span className="shrink-0 text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                            Already added
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            className="shrink-0 h-7 text-xs"
                            disabled={assigning === p.id}
                            onClick={() => assignPatient(p.id)}
                          >
                            {assigning === p.id ? "Adding..." : "Add"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Right panel — Patient detail */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {!selectedPatientId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Pill className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">Select a patient to view their details</p>
            </div>
          ) : (
            <>
              {/* Patient header + tab selector */}
              <div className="shrink-0 px-5 py-3 border-b border-border">
                <h2 className="text-lg font-semibold">
                  {selectedPatient?.patientName || "Unnamed Patient"}
                </h2>
                <p className="text-sm text-muted-foreground">{selectedPatient?.patientEmail}</p>
                <div className="flex gap-1 mt-3">
                  <button
                    onClick={() => setActiveTab("medications")}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeTab === "medications"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Pill className="h-3.5 w-3.5 inline mr-1.5" />
                    Medications
                  </button>
                  <button
                    onClick={() => setActiveTab("conversations")}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      activeTab === "conversations"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <MessageCircle className="h-3.5 w-3.5 inline mr-1.5" />
                    Conversations
                  </button>
                </div>
              </div>

              {/* Tab content */}
              <div className={`flex-1 min-h-0 ${activeTab === "conversations" ? "overflow-hidden" : "overflow-y-auto"} px-5 py-4`}>
                {activeTab === "medications" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Pill className="h-5 w-5 text-primary" />
                        Medications
                      </h3>
                      {!showForm && (
                        <Button size="sm" onClick={openAddForm}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Medication
                        </Button>
                      )}
                    </div>

                    {/* Add/Edit Form */}
                    {showForm && (
                      <form onSubmit={handleSubmit} className="mb-6 p-4 border border-border rounded-lg space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">
                            {editingId ? "Edit Medication" : "Add Medication"}
                          </h3>
                          <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {error && (
                          <p className="text-sm text-destructive">{error}</p>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Medication Name *</Label>
                            <Input
                              id="name"
                              placeholder="e.g. Lisinopril 10mg"
                              value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timesPerDay">Times Per Day *</Label>
                            <Input
                              id="timesPerDay"
                              type="number"
                              min="1"
                              max="24"
                              value={form.timesPerDay}
                              onChange={(e) => setForm({ ...form, timesPerDay: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timingDescription">Timing</Label>
                            <Input
                              id="timingDescription"
                              placeholder="e.g. before meals, at bedtime"
                              value={form.timingDescription}
                              onChange={(e) => setForm({ ...form, timingDescription: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date *</Label>
                            <Input
                              id="startDate"
                              type="date"
                              value={form.startDate}
                              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                              id="endDate"
                              type="date"
                              value={form.endDate}
                              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Input
                              id="notes"
                              placeholder="Any extra information"
                              value={form.notes}
                              onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : editingId ? "Update" : "Add Medication"}
                          </Button>
                          <Button type="button" variant="outline" onClick={closeForm}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Medications List */}
                    {medsLoading ? (
                      <p className="text-muted-foreground">Loading medications...</p>
                    ) : medications.length === 0 ? (
                      <div className="text-center py-8">
                        <Pill className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-muted-foreground">
                          This patient has no medications yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {medications.map((med) => (
                          <div key={med.id}>
                            <MedicationCard
                              medication={med}
                              onEdit={openEditForm}
                              onDelete={handleDelete}
                              onReminderChange={fetchMedications}
                              formatDate={formatDate}
                            />
                            <ClinicalNotes
                              patientId={selectedPatientId}
                              medicationId={med.id}
                              currentUserId={session?.user?.id || ""}
                              currentUserRole={currentUserRole}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "conversations" && (
                  <div className="h-full">
                    <ConversationHistory patientId={selectedPatientId} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
