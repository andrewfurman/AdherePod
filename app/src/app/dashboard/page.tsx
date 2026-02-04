"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Heart, Pill, LogOut, Plus, Pencil, Trash2, X, Calendar, Clock, MessageCircle, Users } from "lucide-react";
import VoiceChat from "@/components/voice-chat";
import ConversationHistory from "@/components/conversation-history";

interface Medication {
  id: string;
  name: string;
  timesPerDay: number;
  timingDescription: string | null;
  startDate: string;
  endDate: string | null;
  notes: string | null;
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
  const [activeTab, setActiveTab] = useState("dashboard");

  const fetchMedications = useCallback(async () => {
    try {
      const res = await fetch("/api/medications");
      if (res.ok) {
        const data = await res.json();
        setMedications(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

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

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
        <nav className="border-b border-border shrink-0">
          <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-7 w-7 text-red-500" />
              <span className="text-xl font-bold">AdherePod</span>
            </div>
            <div className="flex items-center gap-4">
              <TabsList>
                <TabsTrigger value="dashboard">
                  <Pill className="h-4 w-4 mr-1.5" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="history">
                  <MessageCircle className="h-4 w-4 mr-1.5" />
                  History
                </TabsTrigger>
                <TabsTrigger value="users">
                  <Users className="h-4 w-4 mr-1.5" />
                  Users
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
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </nav>

        <main className="flex-1 min-h-0 max-w-7xl w-full mx-auto px-6 pt-4 pb-10 flex flex-col">

          {/* Tab 1: Dashboard — medications + voice chat */}
          <TabsContent value="dashboard" className="flex-1 min-h-0">
            <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column — Medications */}
              <Card className="flex flex-col min-h-0">
                <CardHeader className="shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill className="h-6 w-6 text-primary" />
                      <CardTitle>My Medications</CardTitle>
                    </div>
                    {!showForm && (
                      <Button size="sm" onClick={openAddForm} className="w-44 justify-start">
                        <Plus className="h-4 w-4 mr-2 shrink-0" />
                        Add Medication
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-y-auto">
                  {/* Add/Edit Form */}
                  {showForm && (
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
                        No medications yet. Click &quot;Add Medication&quot; to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {medications.map((med) => (
                        <div
                          key={med.id}
                          className="flex items-start justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium">{med.name}</h4>
                              <Badge variant="secondary">
                                {med.timesPerDay}x / day
                              </Badge>
                              {med.endDate ? (
                                <Badge variant="outline">
                                  Ends {formatDate(med.endDate)}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Ongoing</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              {med.timingDescription && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {med.timingDescription}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Started {formatDate(med.startDate)}
                              </span>
                            </div>
                            {med.notes && (
                              <p className="text-sm text-muted-foreground">{med.notes}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 ml-4 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditForm(med)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(med.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right column — Voice Chat */}
              <VoiceChat onMedicationsChanged={fetchMedications} />
            </div>
          </TabsContent>

          {/* Tab 2: History — conversation timeline */}
          <TabsContent value="history" className="flex-1 min-h-0 overflow-y-auto">
            <ConversationHistory />
          </TabsContent>

          {/* Tab 3: Users — all users table */}
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
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Login</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((user) => {
                        const nameParts = user.name?.trim().split(/\s+/) || [];
                        const firstName = nameParts[0] || "-";
                        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "-";
                        return (
                          <TableRow key={user.id}>
                            <TableCell>{firstName}</TableCell>
                            <TableCell>{lastName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                            <TableCell>{formatDateTime(user.lastLoginAt)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
}
