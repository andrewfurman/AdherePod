"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Users,
  LogOut,
  Search,
  Trash2,
  UserPlus,
  Pill,
  Shield,
  Link2,
  UserX,
  Heart,
} from "lucide-react";
import { AdherepodLogo } from "@/components/adherepod-logo";
import Link from "next/link";

interface ProviderPatient {
  assignmentId: string;
  id: string;
  name: string | null;
  email: string;
  medicationCount: number;
}

interface Provider {
  id: string;
  name: string | null;
  email: string;
  providerType: string | null;
  patientCount: number;
  patients: ProviderPatient[];
}

interface UnassignedPatient {
  id: string;
  name: string | null;
  email: string;
  medicationCount: number;
  createdAt: string;
}

interface DashboardData {
  providers: Provider[];
  unassignedPatients: UnassignedPatient[];
  stats: {
    totalPatients: number;
    totalProviders: number;
    totalAssignments: number;
    unassignedCount: number;
  };
}

interface SearchResult {
  id: string;
  name: string | null;
  email: string;
  alreadyAssigned?: boolean;
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name[0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

function formatProviderType(type: string | null): string {
  if (!type) return "Provider";
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "unassigned" | "manage">("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Manage tab state
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [sendNotification, setSendNotification] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const searchPatients = useCallback(
    async (q: string) => {
      if (q.length < 1) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const providerParam = selectedProviderId ? `&providerId=${selectedProviderId}` : "";
        const res = await fetch(
          `/api/provider/patients/search?q=${encodeURIComponent(q)}${providerParam}`
        );
        if (res.ok) setSearchResults(await res.json());
      } catch {
        // silently fail
      } finally {
        setSearchLoading(false);
      }
    },
    [selectedProviderId]
  );

  // Debounce patient search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "manage" && patientSearch) searchPatients(patientSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearch, activeTab, searchPatients]);

  // Reset search when provider changes
  useEffect(() => {
    setPatientSearch("");
    setSearchResults([]);
  }, [selectedProviderId]);

  const assignPatient = async (patientId: string) => {
    if (!selectedProviderId) return;
    setAssigning(patientId);
    try {
      const res = await fetch("/api/provider/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: selectedProviderId,
          patientId,
          sendNotification,
        }),
      });
      if (res.ok) {
        fetchDashboard();
        setSearchResults((prev) =>
          prev.map((p) => (p.id === patientId ? { ...p, alreadyAssigned: true } : p))
        );
      }
    } catch {
      // silently fail
    } finally {
      setAssigning(null);
    }
  };

  const unassignPatient = async (assignmentId: string) => {
    if (!confirm("Remove this patient assignment?")) return;
    try {
      const res = await fetch(`/api/provider/patients?id=${assignmentId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchDashboard();
    } catch {
      // silently fail
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  const stats = data?.stats;
  const providers = data?.providers || [];
  const unassignedPatients = data?.unassignedPatients || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AdherepodLogo size={56} />
            <span className="text-xl font-bold">AdherePod</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
              Admin Dashboard
            </span>
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
                    <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/my-medications">
                  <DropdownMenuItem>
                    <Pill className="h-4 w-4 mr-2" />
                    My Medications
                  </DropdownMenuItem>
                </Link>
                <Link href="/provider-dashboard">
                  <DropdownMenuItem>
                    <Users className="h-4 w-4 mr-2" />
                    Provider Dashboard
                  </DropdownMenuItem>
                </Link>
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

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-6">
        {/* Tab selector */}
        <div className="flex gap-1 mb-6 border-b border-border pb-3">
          {(
            [
              { key: "overview", label: "Overview", icon: Shield },
              { key: "unassigned", label: "Unassigned Patients", icon: UserX },
              { key: "manage", label: "Manage Assignments", icon: UserPlus },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {key === "unassigned" && (stats?.unassignedCount ?? 0) > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                  {stats?.unassignedCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-3xl font-bold">{stats?.totalPatients ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Providers</p>
                  <p className="text-3xl font-bold">{stats?.totalProviders ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Assignments</p>
                  <p className="text-3xl font-bold">{stats?.totalAssignments ?? 0}</p>
                </CardContent>
              </Card>
              <Card className={stats?.unassignedCount ? "border-amber-400" : ""}>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                  <p className={`text-3xl font-bold ${stats?.unassignedCount ? "text-amber-600" : ""}`}>
                    {stats?.unassignedCount ?? 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Provider Cards */}
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Providers ({providers.length})
            </h3>
            {providers.length === 0 ? (
              <p className="text-muted-foreground">No providers found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.map((provider) => {
                  const isFamilyMember = provider.providerType === "family_member";
                  return (
                    <Card
                      key={provider.id}
                      className={isFamilyMember ? "border-l-4 border-l-purple-400" : ""}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={isFamilyMember ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}>
                                {getInitials(provider.name, provider.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">
                                {provider.name || "Unnamed Provider"}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">{provider.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isFamilyMember ? (
                              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                                <Heart className="h-3 w-3 mr-1" />
                                Family
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                {formatProviderType(provider.providerType)}
                              </Badge>
                            )}
                            <Badge variant="outline">{provider.patientCount} patients</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {provider.patients.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No patients assigned</p>
                        ) : (
                          <div className="space-y-2">
                            {provider.patients.map((patient) => (
                              <div
                                key={patient.id}
                                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 group"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {patient.name || "Unnamed"}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {patient.email}
                                    <span className="ml-2">
                                      <Pill className="h-3 w-3 inline" /> {patient.medicationCount}
                                    </span>
                                  </p>
                                </div>
                                <button
                                  onClick={() => unassignPatient(patient.assignmentId)}
                                  className="hidden group-hover:flex items-center justify-center h-6 w-6 rounded bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
                                  title="Remove assignment"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Unassigned Patients Tab */}
        {activeTab === "unassigned" && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserX className="h-5 w-5 text-amber-600" />
              Unassigned Patients ({unassignedPatients.length})
            </h3>
            {unassignedPatients.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Shield className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    All patients have at least one care team member assigned.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Medications</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unassignedPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          {patient.name || "Unnamed"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {patient.email}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Pill className="h-3.5 w-3.5" />
                            {patient.medicationCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(patient.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveTab("manage");
                              // Pre-fill would need patient context, just switch tab
                            }}
                          >
                            <UserPlus className="h-3.5 w-3.5 mr-1" />
                            Assign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </div>
        )}

        {/* Manage Assignments Tab */}
        {activeTab === "manage" && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              Assign Patient to Provider
            </h3>

            <Card>
              <CardContent className="pt-6 space-y-5">
                {/* Provider selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Provider</label>
                  <select
                    value={selectedProviderId}
                    onChange={(e) => setSelectedProviderId(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Choose a provider...</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.email} ({formatProviderType(p.providerType)}) — {p.patientCount} patients
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient search */}
                {selectedProviderId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search for Patient</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    {/* Search results */}
                    {searchLoading ? (
                      <p className="text-sm text-muted-foreground py-2">Searching...</p>
                    ) : patientSearch.length < 1 ? (
                      <p className="text-sm text-muted-foreground py-2">
                        Type to search for patients
                      </p>
                    ) : searchResults.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No patients found</p>
                    ) : (
                      <div className="space-y-2 mt-2">
                        {searchResults.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-3 border border-border rounded-md"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {p.name || "Unnamed"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                            </div>
                            {p.alreadyAssigned ? (
                              <span className="shrink-0 text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                                Already assigned
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                className="shrink-0"
                                disabled={assigning === p.id}
                                onClick={() => assignPatient(p.id)}
                              >
                                {assigning === p.id ? "Assigning..." : "Assign"}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Notification checkbox */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setSendNotification(!sendNotification)}
                    className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                      sendNotification
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-input bg-background"
                    }`}
                  >
                    {sendNotification && (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <label
                    className="text-sm cursor-pointer"
                    onClick={() => setSendNotification(!sendNotification)}
                  >
                    Send notification emails to provider and patient
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
