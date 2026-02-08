"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Plus } from "lucide-react";

interface ClinicalNote {
  id: string;
  medicationId: string;
  authorId: string;
  authorName: string | null;
  authorEmail: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ClinicalNotesProps {
  patientId: string;
  medicationId: string;
  currentUserId: string;
  currentUserRole: string;
}

export default function ClinicalNotes({
  patientId,
  medicationId,
  currentUserId,
  currentUserRole,
}: ClinicalNotesProps) {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/provider/patients/${patientId}/notes?medicationId=${medicationId}`
      );
      if (res.ok) {
        setNotes(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [patientId, medicationId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/provider/patients/${patientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicationId, content: newNote.trim() }),
      });
      if (res.ok) {
        setNewNote("");
        setShowForm(false);
        fetchNotes();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(
        `/api/provider/patients/${patientId}/notes?id=${noteId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }
    } catch {
      // silently fail
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <p className="text-xs text-muted-foreground py-1">Loading notes...</p>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Clinical Notes ({notes.length})
          </span>
        </div>
        {!showForm && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Note
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-2 space-y-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a clinical note..."
            className="w-full text-sm rounded-md border border-input bg-transparent px-3 py-2 min-h-[60px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={handleAdd} disabled={saving || !newNote.trim()}>
              {saving ? "Saving..." : "Save Note"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                setShowForm(false);
                setNewNote("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="text-sm p-2 bg-muted/50 rounded-md"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="whitespace-pre-wrap">{note.content}</p>
                {(note.authorId === currentUserId || currentUserRole === "admin") && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {note.authorName || note.authorEmail} &middot; {formatDate(note.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
