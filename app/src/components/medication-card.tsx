"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Clock, Calendar } from "lucide-react";

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

interface MedicationCardProps {
  medication: Medication;
  highlight?: { oldMed: Medication };
  onEdit: (med: Medication) => void;
  onDelete: (id: string) => void;
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

export default function MedicationCard({
  medication: med,
  highlight,
  onEdit,
  onDelete,
  formatDate,
}: MedicationCardProps) {
  const isHighlighted = !!highlight;
  const old = highlight?.oldMed;

  const containerClass = isHighlighted
    ? "flex items-start justify-between p-4 border rounded-lg border-orange-400 bg-orange-50 dark:border-orange-500 dark:bg-orange-950/30 animate-pulse-orange"
    : "flex items-start justify-between p-4 border border-border rounded-lg";

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
    </div>
  );
}
