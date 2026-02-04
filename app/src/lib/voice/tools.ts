import { tool } from "@openai/agents";
import { z } from "zod";

export const listMedications = tool({
  name: "list_medications",
  description: "List all of the user's current medications",
  parameters: z.object({}),
  execute: async () => {
    const res = await fetch("/api/medications");
    return res.json();
  },
});

export const addMedication = tool({
  name: "add_medication",
  description: "Add a new medication for the user",
  parameters: z.object({
    name: z
      .string()
      .describe("Medication name and dosage, e.g. 'Lisinopril 10mg'"),
    timesPerDay: z.number().describe("How many times per day to take it"),
    timingDescription: z
      .string()
      .optional()
      .describe("When to take it, e.g. 'before meals', 'at bedtime'"),
    startDate: z.string().describe("Start date in YYYY-MM-DD format"),
    endDate: z
      .string()
      .optional()
      .describe("End date in YYYY-MM-DD format, omit if ongoing"),
    notes: z.string().optional().describe("Any additional notes"),
  }),
  execute: async (params) => {
    const res = await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return res.json();
  },
});

export const editMedication = tool({
  name: "edit_medication",
  description: "Update an existing medication",
  parameters: z.object({
    id: z.string().describe("The medication ID to update"),
    name: z.string().optional().describe("New medication name"),
    timesPerDay: z.number().optional().describe("New times per day"),
    timingDescription: z.string().optional().describe("New timing description"),
    endDate: z.string().optional().describe("New end date in YYYY-MM-DD format"),
    notes: z.string().optional().describe("New notes"),
  }),
  execute: async (params) => {
    const res = await fetch("/api/medications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return res.json();
  },
});

export const deleteMedication = tool({
  name: "delete_medication",
  description: "Delete a medication from the user's list",
  parameters: z.object({
    id: z.string().describe("The medication ID to delete"),
  }),
  execute: async ({ id }) => {
    const res = await fetch(`/api/medications?id=${id}`, {
      method: "DELETE",
    });
    return res.json();
  },
});
