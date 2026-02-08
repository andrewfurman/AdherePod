"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Heart, Pill, LogOut, Plus, X, MessageCircle, Users, Settings, Lock, Pencil, Check, Mail, Eye, KeyRound } from "lucide-react";
import Link from "next/link";
import VoiceChat from "@/components/voice-chat";
import ConversationHistory from "@/components/conversation-history";
import MedicationCard from "@/components/medication-card";

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

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  providerType: string | null;
  timezone: string | null;
  createdAt: string;
  lastLoginAt: string | null;
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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MedicationForm>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("medications");
  const [editHighlights, setEditHighlights] = useState<Map<string, { oldMed: Medication }>>(new Map());
  const medicationsRef = useRef<Medication[]>([]);
  const [userSettings, setUserSettings] = useState({
    timezone: "America/New_York",
    dailySummaryEnabled: true,
    dailySummaryTime: "08:00",
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("user");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({ name: "", email: "" });
  const [resetSending, setResetSending] = useState<string | null>(null);
  const [setPasswordUserId, setSetPasswordUserId] = useState<string | null>(null);
  const [setPasswordValue, setSetPasswordValue] = useState("");
  const [adminSetPwSaving, setAdminSetPwSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Impersonation state
  const [viewAsUserId, setViewAsUserId] = useState<string | null>(null);
  const [viewAsUserInfo, setViewAsUserInfo] = useState<{ name: string | null; email: string } | null>(null);
  const isImpersonating = !!viewAsUserId;

  // Read viewAs from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewAs = params.get("viewAs");
    if (viewAs) {
      setViewAsUserId(viewAs);
    }
  }, []);

  // Helper to append viewAs to API URLs
  const apiUrl = useCallback((base: string, extraParams?: Record<string, string>) => {
    const params = new URLSearchParams(extraParams);
    if (viewAsUserId) params.set("viewAs", viewAsUserId);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [viewAsUserId]);

  const fetchMedications = useCallback(async () => {
    try {
      const snapshot = new Map(
        medicationsRef.current.map((m) => [m.id, m])
      );

      const res = await fetch(apiUrl("/api/medications"));
      if (res.ok) {
        const data: Medication[] = await res.json();

        if (snapshot.size > 0) {
          const newHighlights = new Map<string, { oldMed: Medication }>();
          for (const med of data) {
            const old = snapshot.get(med.id);
            if (
              old &&
              (old.name !== med.name ||
                old.timesPerDay !== med.timesPerDay ||
                (old.timingDescription || "") !== (med.timingDescription || "") ||
                (old.notes || "") !== (med.notes || ""))
            ) {
              newHighlights.set(med.id, { oldMed: old });
            }
          }
          if (newHighlights.size > 0) {
            setEditHighlights((prev) => {
              const merged = new Map(prev);
              newHighlights.forEach((v, k) => merged.set(k, v));
              return merged;
            });
            setTimeout(() => {
              setEditHighlights((prev) => {
                const next = new Map(prev);
                newHighlights.forEach((_, k) => next.delete(k));
                return next;
              });
            }, 15000);
          }
        }

        setMedications(data);
        medicationsRef.current = data;
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch {
      // silently fail
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch(apiUrl("/api/user/settings"));
      if (res.ok) {
        const data = await res.json();
        setUserSettings(data);
      }
    } catch {
      // silently fail
    } finally {
      setSettingsLoading(false);
    }
  }, [apiUrl]);

  const updateSetting = async (key: string, value: unknown) => {
    if (isImpersonating) return; // Block writes during impersonation
    const newSettings = { ...userSettings, [key]: value };
    setUserSettings(newSettings);
    try {
      await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // Fetch current user's role from DB so it works even with stale JWTs
  useEffect(() => {
    async function fetchRole() {
      try {
        // Always fetch own role (no viewAs)
        const res = await fetch("/api/user/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.role) setCurrentUserRole(data.role);
        }
      } catch { /* silently fail */ }
    }
    fetchRole();
  }, []);

  // When impersonating, fetch target user info for the banner
  useEffect(() => {
    if (!viewAsUserId) return;
    async function fetchViewAsInfo() {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const users: User[] = await res.json();
          const target = users.find((u) => u.id === viewAsUserId);
          if (target) {
            setViewAsUserInfo({ name: target.name, email: target.email });
          }
        }
      } catch { /* silently fail */ }
    }
    fetchViewAsInfo();
  }, [viewAsUserId]);

  // Auto-detect and save the user's browser timezone on each visit (skip when impersonating)
  useEffect(() => {
    if (isImpersonating) return;
    const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detectedTz) {
      fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: detectedTz }),
      }).catch(() => {});
    }
  }, [isImpersonating]);

  useEffect(() => {
    if (activeTab === "users" && !isImpersonating) {
      fetchUsers();
    }
    if (activeTab === "settings") {
      fetchSettings();
    }
  }, [activeTab, fetchUsers, fetchSettings, isImpersonating]);

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
        ...(editingId ? { id: editingId } : {}),
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

  const tzAbbrev: Record<string, string> = {
    "America/New_York": "ET",
    "America/Chicago": "CT",
    "America/Denver": "MT",
    "America/Los_Angeles": "PT",
    "America/Anchorage": "AKT",
    "Pacific/Honolulu": "HT",
  };

  const formatDateTime = (dateStr: string | null, timezone?: string | null) => {
    if (!dateStr) return "Never";
    const tz = timezone || undefined;
    const formatted = new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz,
    });
    const abbrev = tz ? tzAbbrev[tz] : null;
    return abbrev ? `${formatted} ${abbrev}` : formatted;
  };

  const startImpersonating = (userId: string) => {
    setViewAsUserId(userId);
    setActiveTab("medications");
    window.history.pushState({}, "", `/my-medications?viewAs=${userId}`);
  };

  const exitImpersonation = () => {
    setViewAsUserId(null);
    setViewAsUserInfo(null);
    window.history.pushState({}, "", "/my-medications");
  };

  const viewAsUserLabel = viewAsUserInfo
    ? viewAsUserInfo.name || viewAsUserInfo.email
    : viewAsUserId;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
        <nav className="border-b border-border shrink-0">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-7 w-7 text-red-500" />
              <span className="text-xl font-bold">AdherePod</span>
            </Link>
            <div className="flex items-center gap-4">
              <TabsList>
                <TabsTrigger value="medications">
                  <Pill className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">My Medications</span>
                </TabsTrigger>
                <TabsTrigger value="history">
                  <MessageCircle className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
              </TabsList>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
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
                  {!isImpersonating && (
                    <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  )}
                  {currentUserRole === "admin" && !isImpersonating && (
                    <DropdownMenuItem onClick={() => setActiveTab("users")}>
                      <Users className="h-4 w-4 mr-2" />
                      Users
                    </DropdownMenuItem>
                  )}
                  {isImpersonating && (
                    <DropdownMenuItem onClick={exitImpersonation}>
                      <X className="h-4 w-4 mr-2" />
                      Exit View As
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>

        {/* Impersonation banner */}
        {isImpersonating && (
          <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 shrink-0">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Viewing as: {viewAsUserLabel} (read-only)
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-amber-400 text-amber-800 hover:bg-amber-200"
                onClick={exitImpersonation}
              >
                <X className="h-3 w-3 mr-1" />
                Exit
              </Button>
            </div>
          </div>
        )}

        <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 md:px-6 pt-4 pb-6 md:pb-10 flex flex-col">

          {/* Tab 1: Dashboard — medications + voice chat */}
          <TabsContent value="medications" className="flex-1 min-h-0">
            <div className={`h-full grid grid-cols-1 ${isImpersonating ? "" : "lg:grid-cols-2"} gap-6`}>
              {/* Left column — Medications */}
              <Card className="flex flex-col min-h-0">
                <CardHeader className="shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill className="h-6 w-6 text-primary" />
                      <CardTitle>
                        {isImpersonating
                          ? `${viewAsUserLabel}'s Medications`
                          : "My Medications"}
                      </CardTitle>
                    </div>
                    {!showForm && !isImpersonating && (
                      <Button size="sm" onClick={openAddForm} className="w-44 justify-start">
                        <Plus className="h-4 w-4 mr-2 shrink-0" />
                        Add Medication
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-y-auto">
                  {/* Add/Edit Form */}
                  {showForm && !isImpersonating && (
                    <form onSubmit={handleSubmit} className="mb-6 p-4 border border-border rounded-lg space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          {editingId ? "Edit Medication" : "Add New Medication"}
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
                  {loading ? (
                    <p className="text-muted-foreground">Loading medications...</p>
                  ) : medications.length === 0 ? (
                    <div className="text-center py-8">
                      <Pill className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        {isImpersonating
                          ? "This user has no medications."
                          : 'No medications yet. Click "Add Medication" to get started.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {medications.map((med) => (
                        <MedicationCard
                          key={med.id}
                          medication={med}
                          highlight={editHighlights.get(med.id)}
                          onEdit={openEditForm}
                          onDelete={handleDelete}
                          onReminderChange={fetchMedications}
                          formatDate={formatDate}
                          readOnly={isImpersonating}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right column — Voice Chat (hidden when impersonating) */}
              {!isImpersonating && (
                <VoiceChat onMedicationsChanged={fetchMedications} />
              )}
            </div>
          </TabsContent>

          {/* Tab 2: History — conversation timeline */}
          <TabsContent value="history" className="flex-1 min-h-0 overflow-y-auto">
            <ConversationHistory viewAsUserId={viewAsUserId || undefined} />
          </TabsContent>

          {/* Tab 3: Settings — user preferences (hidden when impersonating) */}
          {!isImpersonating && (
            <TabsContent value="settings" className="flex-1 min-h-0 overflow-y-auto">
              <div className="max-w-lg space-y-6">
                {/* Reminder Settings */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Settings className="h-6 w-6 text-primary" />
                      <CardTitle>Reminder Settings</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {settingsLoading ? (
                      <p className="text-muted-foreground">Loading settings...</p>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Timezone</Label>
                          <select
                            id="timezone"
                            value={userSettings.timezone}
                            onChange={(e) => updateSetting("timezone", e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="America/New_York">Eastern (ET)</option>
                            <option value="America/Chicago">Central (CT)</option>
                            <option value="America/Denver">Mountain (MT)</option>
                            <option value="America/Los_Angeles">Pacific (PT)</option>
                            <option value="America/Anchorage">Alaska (AKT)</option>
                            <option value="Pacific/Honolulu">Hawaii (HT)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="dailySummary">Daily Medication Summary Email</Label>
                            <button
                              onClick={() => updateSetting("dailySummaryEnabled", !userSettings.dailySummaryEnabled)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                userSettings.dailySummaryEnabled ? "bg-primary" : "bg-input"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                                  userSettings.dailySummaryEnabled ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Receive a daily email listing all your active medications and their schedules.
                          </p>
                        </div>

                        {userSettings.dailySummaryEnabled && (
                          <div className="space-y-2">
                            <Label htmlFor="summaryTime">Summary Time</Label>
                            <Input
                              id="summaryTime"
                              type="time"
                              value={userSettings.dailySummaryTime}
                              onChange={(e) => updateSetting("dailySummaryTime", e.target.value)}
                              className="w-32"
                            />
                            <p className="text-xs text-muted-foreground">
                              Time in your local timezone when you&apos;ll receive the summary.
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Lock className="h-6 w-6 text-primary" />
                      <CardTitle>Change Password</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setPasswordError("");
                        setPasswordSuccess("");

                        if (passwordForm.new !== passwordForm.confirm) {
                          setPasswordError("New passwords do not match");
                          return;
                        }
                        if (passwordForm.new.length < 8) {
                          setPasswordError("New password must be at least 8 characters");
                          return;
                        }

                        setPasswordSaving(true);
                        try {
                          const res = await fetch("/api/user/change-password", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              currentPassword: passwordForm.current,
                              newPassword: passwordForm.new,
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok) {
                            setPasswordError(data.error || "Failed to change password");
                          } else {
                            setPasswordSuccess("Password updated successfully");
                            setPasswordForm({ current: "", new: "", confirm: "" });
                          }
                        } catch {
                          setPasswordError("Something went wrong");
                        } finally {
                          setPasswordSaving(false);
                        }
                      }}
                      className="space-y-4"
                    >
                      {passwordError && (
                        <p className="text-sm text-destructive">{passwordError}</p>
                      )}
                      {passwordSuccess && (
                        <p className="text-sm text-green-600">{passwordSuccess}</p>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          required
                          minLength={8}
                        />
                      </div>
                      <Button type="submit" disabled={passwordSaving}>
                        {passwordSaving ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Tab 4: Users — all users table (hidden when impersonating) */}
          {!isImpersonating && (
            <TabsContent value="users" className="flex-1 min-h-0 overflow-y-auto">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-primary" />
                    <CardTitle>All Users</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <p className="text-muted-foreground">Loading users...</p>
                  ) : allUsers.length === 0 ? (
                    <p className="text-muted-foreground">No users found.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Login</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allUsers.map((u) => {
                          const isEditing = editingUserId === u.id;
                          return (
                            <TableRow key={u.id}>
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    value={editUserForm.name}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                                    className="h-7 text-sm w-40"
                                  />
                                ) : (
                                  u.name || "-"
                                )}
                              </TableCell>
                              <TableCell>
                                {isEditing ? (
                                  <Input
                                    value={editUserForm.email}
                                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                                    className="h-7 text-sm w-48"
                                  />
                                ) : (
                                  u.email
                                )}
                              </TableCell>
                              <TableCell>
                                {currentUserRole === "admin" && u.id !== session?.user?.id ? (
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={u.role === "user" ? "patient" : u.role}
                                      onChange={async (e) => {
                                        const newRole = e.target.value;
                                        try {
                                          const updates: Record<string, string | null> = { userId: u.id, role: newRole };
                                          // Clear providerType when switching away from provider
                                          if (newRole !== "provider") {
                                            updates.providerType = null;
                                          }
                                          const res = await fetch("/api/users", {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(updates),
                                          });
                                          if (res.ok) fetchUsers();
                                        } catch { /* silently fail */ }
                                      }}
                                      className="text-xs rounded border border-input bg-transparent px-2 py-1"
                                    >
                                      <option value="patient">patient</option>
                                      <option value="provider">provider</option>
                                      <option value="admin">admin</option>
                                    </select>
                                    {(u.role === "provider") && (
                                      <select
                                        value={u.providerType || ""}
                                        onChange={async (e) => {
                                          const newType = e.target.value || null;
                                          try {
                                            const res = await fetch("/api/users", {
                                              method: "PUT",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ userId: u.id, providerType: newType }),
                                            });
                                            if (res.ok) fetchUsers();
                                          } catch { /* silently fail */ }
                                        }}
                                        className="text-xs rounded border border-input bg-transparent px-2 py-1"
                                      >
                                        <option value="">Type...</option>
                                        <option value="nurse">Nurse</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="care_team_member">Care Team</option>
                                      </select>
                                    )}
                                  </div>
                                ) : (
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-primary/10 text-primary font-medium" : u.role === "provider" ? "bg-blue-100 text-blue-700 font-medium" : "bg-muted text-muted-foreground"}`}>
                                    {u.role === "user" ? "patient" : u.role}
                                    {u.role === "provider" && u.providerType && ` (${u.providerType.replace("_", " ")})`}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">{formatDateTime(u.createdAt, u.timezone)}</TableCell>
                              <TableCell className="text-sm">{formatDateTime(u.lastLoginAt, u.timezone)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {isEditing ? (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        title="Save"
                                        onClick={async () => {
                                          try {
                                            const res = await fetch("/api/users", {
                                              method: "PUT",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                userId: u.id,
                                                name: editUserForm.name,
                                                email: editUserForm.email,
                                              }),
                                            });
                                            if (res.ok) {
                                              setEditingUserId(null);
                                              fetchUsers();
                                            }
                                          } catch { /* silently fail */ }
                                        }}
                                      >
                                        <Check className="h-3.5 w-3.5 text-green-600" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        title="Cancel"
                                        onClick={() => setEditingUserId(null)}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        title="View as this user"
                                        onClick={() => startImpersonating(u.id)}
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        title="Edit user"
                                        onClick={() => {
                                          setEditingUserId(u.id);
                                          setEditUserForm({ name: u.name || "", email: u.email });
                                        }}
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        title="Send password reset email"
                                        disabled={resetSending === u.id}
                                        onClick={async () => {
                                          setResetSending(u.id);
                                          try {
                                            const res = await fetch("/api/users", {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({ userId: u.id, action: "reset-password" }),
                                            });
                                            if (res.ok) {
                                              alert(`Password reset email sent to ${u.email}`);
                                            }
                                          } catch { /* silently fail */ }
                                          setResetSending(null);
                                        }}
                                      >
                                        <Mail className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        title="Set password"
                                        onClick={() => {
                                          setSetPasswordUserId(u.id);
                                          setSetPasswordValue("");
                                        }}
                                      >
                                        <KeyRound className="h-3.5 w-3.5" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Set Password Dialog */}
              {setPasswordUserId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <Card className="w-96">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Set Password</CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => setSetPasswordUserId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Set a new password for {allUsers.find(u => u.id === setPasswordUserId)?.email}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="setPassword">New Password</Label>
                          <Input
                            id="setPassword"
                            type="text"
                            placeholder="Enter new password (min 8 chars)"
                            value={setPasswordValue}
                            onChange={(e) => setSetPasswordValue(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            disabled={adminSetPwSaving || setPasswordValue.length < 8}
                            onClick={async () => {
                              setAdminSetPwSaving(true);
                              try {
                                const res = await fetch("/api/users", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    userId: setPasswordUserId,
                                    action: "set-password",
                                    password: setPasswordValue,
                                  }),
                                });
                                if (res.ok) {
                                  alert("Password updated successfully");
                                  setSetPasswordUserId(null);
                                  setSetPasswordValue("");
                                } else {
                                  const data = await res.json();
                                  alert(data.error || "Failed to set password");
                                }
                              } catch {
                                alert("Something went wrong");
                              } finally {
                                setAdminSetPwSaving(false);
                              }
                            }}
                          >
                            {adminSetPwSaving ? "Saving..." : "Set Password"}
                          </Button>
                          <Button variant="outline" onClick={() => setSetPasswordUserId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          )}
        </main>
      </Tabs>
    </div>
  );
}
