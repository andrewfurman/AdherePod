"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Clock, Calendar, Bell, BellOff } from "lucide-react";

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

interface MedicationCardProps {
  medication: Medication;
  highlight?: { oldMed: Medication };
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
  onReminderChange?: () => void;
  formatDate: (dateStr: string) => string;
}

function ChangedField({
  oldValue,
  newValue,
}: {
  oldValue: string;
  newValue: string;
}) {
  if (oldValue === newValue) {
    return <>{newValue}</>;
  }
  return (
    <>
      <span className="line-through text-orange-400 dark:text-orange-300 mr-1">
        {oldValue}
      </span>
      <span className="font-semibold text-orange-600 dark:text-orange-400">
        {newValue}
      </span>
    </>
  );
}

function getDefaultTimes(timesPerDay: number): string[] {
  if (timesPerDay >= 3) return ["08:00", "14:00", "20:00"];
  if (timesPerDay === 2) return ["08:00", "20:00"];
  return ["08:00"];
}

export default function MedicationCard({
  medication: med,
  highlight,
  onEdit,
  onDelete,
  onReminderChange,
  formatDate,
}: MedicationCardProps) {
  const [reminderSaving, setReminderSaving] = useState(false);

  const parsedTimes: string[] = med.reminderTimes
    ? (() => { try { return JSON.parse(med.reminderTimes); } catch { return []; } })()
    : [];

  const handleToggleReminder = async () => {
    setReminderSaving(true);
    try {
      const newEnabled = !med.reminderEnabled;
      const body: Record<string, unknown> = {
        id: med.id,
        reminderEnabled: newEnabled,
      };
      // Auto-generate default times when enabling with no times set
      if (newEnabled && parsedTimes.length === 0) {
        body.reminderTimes = JSON.stringify(getDefaultTimes(med.timesPerDay));
      }
      await fetch("/api/medications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      onReminderChange?.();
    } catch {
      // silently fail
    } finally {
      setReminderSaving(false);
    }
  };

  const handleUpdateTime = async (index: number, value: string) => {
    const newTimes = [...parsedTimes];
    newTimes[index] = value;
    try {
      await fetch("/api/medications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: med.id,
          reminderTimes: JSON.stringify(newTimes),
        }),
      });
      onReminderChange?.();
    } catch {
      // silently fail
    }
  };

  const isHighlighted = !!highlight;
  const old = highlight?.oldMed;

  const containerClass = isHighlighted
    ? "flex flex-wrap items-start justify-between p-4 border rounded-lg border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-950/30 animate-pulse-orange"
    : "flex flex-wrap items-start justify-between p-4 border border-border rounded-lg";

  return (
    <div className={containerClass}>
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium">
            {old && old.name !== med.name ? (
              <ChangedField oldValue={old.name} newValue={med.name} />
            ) : (
              med.name
            )}
          </h4>
          <Badge variant="secondary">
            {old && old.timesPerDay !== med.timesPerDay ? (
              <ChangedField
                oldValue={`${old.timesPerDay}x / day`}
                newValue={`${med.timesPerDay}x / day`}
              />
            ) : (
              <>{med.timesPerDay}x / day</>
            )}
          </Badge>
          {med.endDate ? (
            <Badge variant="outline">Ends {formatDate(med.endDate)}</Badge>
          ) : (
            <Badge variant="outline">Ongoing</Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          {(med.timingDescription || (old && old.timingDescription)) && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {old &&
              (old.timingDescription || "") !==
                (med.timingDescription || "") ? (
                <ChangedField
                  oldValue={old.timingDescription || "(none)"}
                  newValue={med.timingDescription || "(none)"}
                />
              ) : (
                med.timingDescription
              )}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Started {formatDate(med.startDate)}
          </span>
        </div>
        {(med.notes || (old && old.notes)) && (
          <p className="text-sm text-muted-foreground">
            {old && (old.notes || "") !== (med.notes || "") ? (
              <ChangedField
                oldValue={old.notes || "(none)"}
                newValue={med.notes || "(none)"}
              />
            ) : (
              med.notes
            )}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 ml-4 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => onEdit(med)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(med.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      {/* Reminder toggle row — always visible */}
      <div className="w-full mt-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {med.reminderEnabled ? (
              <Bell className="h-4 w-4 text-primary" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">Email Reminders</span>
          </div>
          <button
            onClick={handleToggleReminder}
            disabled={reminderSaving}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
              med.reminderEnabled ? "bg-primary" : "bg-input"
            }`}
            aria-label={med.reminderEnabled ? "Disable email reminders" : "Enable email reminders"}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                med.reminderEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {med.reminderEnabled && (
          <div className="mt-2 ml-6">
            <p className="text-xs text-muted-foreground mb-1.5">
              You&apos;ll get an email at these times:
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {parsedTimes.map((time, i) => (
                <Input
                  key={i}
                  type="time"
                  value={time}
                  onChange={(e) => handleUpdateTime(i, e.target.value)}
                  className="w-28 h-7 text-xs"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
