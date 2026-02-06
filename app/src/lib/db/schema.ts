import {
  pgTable,
  text,
  timestamp,
  boolean,
  primaryKey,
  integer,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp("last_login_at", { mode: "date", withTimezone: true }),
  timezone: text("timezone").default("America/New_York"),
  dailySummaryEnabled: boolean("daily_summary_enabled").default(true).notNull(),
  dailySummaryTime: text("daily_summary_time").default("08:00"),
  lastDailySummarySentAt: timestamp("last_daily_summary_sent_at", { mode: "date", withTimezone: true }),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

export const medications = pgTable("medications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  timesPerDay: integer("times_per_day").notNull(),
  timingDescription: text("timing_description"),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }),
  notes: text("notes"),
  reminderEnabled: boolean("reminder_enabled").default(false).notNull(),
  reminderTimes: text("reminder_times"),
  lastReminderSentAt: timestamp("last_reminder_sent_at", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"),
  title: text("title"),
  transcript: text("transcript"),
  summary: text("summary"),
  startedAt: timestamp("started_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { mode: "date", withTimezone: true }),
});

export const conversationMessages = pgTable("conversation_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  toolName: text("tool_name"),
  toolArgs: text("tool_args"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const imageCaptures = pgTable("image_captures", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conversationId: text("conversation_id")
    .references(() => conversations.id, { onDelete: "set null" }),
  imageUrl: text("image_url").notNull(),
  extractedText: text("extracted_text"),
  description: text("description"),
  extractedMedications: text("extracted_medications"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const emailSends = pgTable("email_sends", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  recipientEmail: text("recipient_email").notNull(),
  messageType: text("message_type").notNull(),
  subject: text("subject").notNull(),
  htmlBody: text("html_body").notNull(),
  sgMessageId: text("sg_message_id"),
  sentAt: timestamp("sent_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const emailEvents = pgTable("email_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  emailSendId: text("email_send_id")
    .references(() => emailSends.id, { onDelete: "cascade" }),
  sgEventId: text("sg_event_id").unique(),
  event: text("event").notNull(),
  timestamp: timestamp("timestamp", { mode: "date", withTimezone: true }).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});
