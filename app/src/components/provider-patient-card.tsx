"use client";

import { Pill, User } from "lucide-react";

interface ProviderPatientCardProps {
  patientName: string | null;
  patientEmail: string;
  medicationCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function ProviderPatientCard({
  patientName,
  patientEmail,
  medicationCount,
  isSelected,
  onClick,
}: ProviderPatientCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 border-b border-border transition-colors ${
        isSelected ? "bg-background shadow-sm" : "hover:bg-background/60"
      }`}
    >
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${isSelected ? "text-foreground" : "text-foreground/80"}`}>
            {patientName || "Unnamed Patient"}
          </p>
          <p className="text-xs text-muted-foreground truncate">{patientEmail}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1 ml-6 text-xs text-muted-foreground">
        <Pill className="h-3 w-3" />
        <span>{medicationCount} medication{medicationCount !== 1 ? "s" : ""}</span>
      </div>
    </button>
  );
}
