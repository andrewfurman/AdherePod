# AdherePod Data Model

This document describes the core database schema, table structures, and relationships in AdherePod. The schema is defined in `app/src/lib/db/schema.ts` using Drizzle ORM backed by PostgreSQL (Neon).

---

## Entity Relationship Overview

```
users
 ├──< medications           (one user has many medications)
 │      └──< clinicalNotes  (one medication has many clinical notes)
 ├──< conversations         (one user has many conversations)
 │      ├──< conversationMessages  (one conversation has many messages)
 │      └──< imageCaptures         (one conversation has many image captures)
 ├──< imageCaptures         (one user has many image captures)
 ├──< emailSends            (one user has many email sends)
 │      └──< emailEvents    (one email send has many delivery events)
 ├──< passwordResetTokens   (one user has many reset tokens)
 ├──< accounts              (NextAuth OAuth accounts)
 ├──< sessions              (NextAuth sessions)
 └──<> providerPatients     (many-to-many: providers <-> patients)
          ↑
          └── assignedBy -> users  (who created the assignment)
```

### Relationship Legend

- `──<` = one-to-many (parent has many children)
- `──<>` = many-to-many (via junction table)
- `->` = foreign key reference

---

## Tables

### users

The central table. Stores patients, providers, and admins in a single table differentiated by `role`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK, UUID | Unique identifier |
| name | text | nullable | Display name |
| email | text | UNIQUE, NOT NULL | Login email |
| emailVerified | timestamp | nullable | When email was verified |
| image | text | nullable | Profile image URL |
| password | text | nullable | bcrypt-hashed password |
| role | text | NOT NULL, default "patient" | `patient`, `provider`, or `admin` |
| providerType | text | nullable | `nurse`, `doctor`, `care_team_member`, or `family_member` (only when role=provider) |
| phone | text | nullable | Contact phone number |
| createdAt | timestamp | NOT NULL, default now | Account creation time |
| lastLoginAt | timestamp | nullable | Last successful login |
| timezone | text | default "America/New_York" | User's timezone (for reminders) |
| dailySummaryEnabled | boolean | NOT NULL, default true | Receive daily medication summary email |
| dailySummaryTime | text | default "08:00" | HH:mm time for daily summary |
| lastDailySummarySentAt | timestamp | nullable | Prevents duplicate daily summaries |

**Role-based behavior:**
- **patient** (default): Accesses `/my-medications`, manages own meds, uses voice chat
- **provider**: Accesses `/provider-dashboard`, views assigned patients' meds/conversations, writes clinical notes
- **admin**: Full access, user management, impersonation, all data visibility

---

### medications

Patient medication records with reminder configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK, UUID | Unique identifier |
| userId | text | FK -> users.id (cascade), NOT NULL | Patient who owns this medication |
| name | text | NOT NULL | Medication name (e.g., "Lisinopril 10mg") |
| timesPerDay | integer | NOT NULL | Daily dose frequency (1-24) |
| timingDescription | text | nullable | When to take it (e.g., "morning and evening with food") |
| startDate | timestamp | NOT NULL | When to start taking medication |
| endDate | timestamp | nullable | When to stop (null = ongoing) |
| notes | text | nullable | Additional notes |
| reminderEnabled | boolean | NOT NULL, default false | Email reminders on/off |
| reminderTimes | text | nullable | JSON array of HH:mm times (e.g., `["08:00","20:00"]`) |
| lastReminderSentAt | timestamp | nullable | Prevents duplicate reminder sends |
| createdAt | timestamp | NOT NULL, default now | Record creation |
| updatedAt | timestamp | NOT NULL, default now | Last modification |

**Relationship:** Many-to-one with `users` (cascade delete).

---

### providerPatients (junction table)

Many-to-many relationship linking providers to their assigned patients.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK, UUID | Unique identifier |
| providerId | text | FK -> users.id (cascade), NOT NULL | The provider |
| patientId | text | FK -> users.id (cascade), NOT NULL | The patient |
| assignedBy | text | FK -> users.id (cascade), NOT NULL | Admin or provider who created the link |
| createdAt | timestamp | NOT NULL, default now | When assignment was made |

**UNIQUE constraint:** `(providerId, patientId)` -- prevents duplicate assignments.

**Three foreign keys to users:**
1. `providerId` -> the provider user
2. `patientId` -> the patient user
3. `assignedBy` -> the user who made the assignment (audit trail)

---

### clinicalNotes

Provider notes attached to specific patient medications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK, UUID | Unique identifier |
| medicationId | text | FK -> medications.id (cascade), NOT NULL | Which medication |
| authorId | text | FK -> users.id (cascade), NOT NULL | Provider who wrote the note |
| content | text | NOT NULL | Note text |
| createdAt | timestamp | NOT NULL, default now | Creation time |
| updatedAt | timestamp | NOT NULL, default now | Last update |

**Relationships:**
- Many-to-one with `medications` (cascade delete -- deleting a med deletes its notes)
- Many-to-one with `users` (cascade delete -- the author)

---

### conversations

Voice chat session records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK, UUID | Unique identifier |
| userId | text | FK -> users.id (cascade), NOT NULL | Patient who had the conversation |
| status | text | NOT NULL, default "active" | `active`, `completed`, or `archived` |
| title | text | nullable | AI-generated summary title (via Gemini) |
| transcript | text | nullable | Full voice transcript |
| summary | text | nullable | AI-generated conversation summary |
| startedAt | timestamp | NOT NULL, default now | When conversation started |
| endedAt | timestamp | nullable | When conversation ended |

**Relationship:** Many-to-one with `users` (cascade delete).

---

### conversationMessages

Individual messages within a voice conversation, including tool calls.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK, UUID | Unique identifier |
| conversationId | text | FK -> conversations.id (cascade), NOT NULL | Parent conversation |
| role | text | NOT NULL | `user` or `assistant` |
| content | text | NOT NULL | Message text |
| toolName | text | nullable | Voice tool invoked (e.g., `addMedication`) |
| toolArgs | text | nullable | JSON arguments passed to tool |
| createdAt | timestamp | NOT NULL, default now | Message timestamp |

**Relationship:** Many-to-one with `conversations` (cascade delete).

---

### imageCaptures

Camera captures during voice conversations (for reading pill bottles/prescriptions).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK, UUID | Unique identifier |
| userId | text | FK -> users.id (cascade), NOT NULL | User who captured |
| conversationId | text | FK -> conversations.id (set null), nullable | Associated conversation |
| imageUrl | text | NOT NULL | URL/path to captured image |
| extractedText | text | nullable | OCR text extracted from image |
| description | text | nullable | User's description of image |
| extractedMedications | text | nullable | JSON list of medications detected |
| createdAt | timestamp | NOT NULL, default now | Capture time |

**Relationships:**
- Many-to-one with `users` (cascade delete)
- Many-to-one with `conversations` (set null on delete -- images survive conversation deletion)

---

### emailSends

Log of every email sent by the system (reminders, summaries, password resets, notifications).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK, UUID | Unique identifier |
| userId | text | FK -> users.id (set null), nullable | Recipient user |
| recipientEmail | text | NOT NULL | Email address |
| messageType | text | NOT NULL | `reminder`, `summary`, `verification`, `reset`, `notification` |
| subject | text | NOT NULL | Email subject line |
| htmlBody | text | NOT NULL | Full HTML email body (stored for history view) |
| sgMessageId | text | nullable | SendGrid message ID (for webhook correlation) |
| sentAt | timestamp | NOT NULL, default now | When email was sent |
| createdAt | timestamp | NOT NULL, default now | Record creation |

**Relationship:** Many-to-one with `users` (set null on delete -- email records survive user deletion).

---

### emailEvents

SendGrid webhook events tracking email delivery lifecycle.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK, UUID | Unique identifier |
| emailSendId | text | FK -> emailSends.id (cascade), nullable | Parent email |
| sgEventId | text | UNIQUE, nullable | SendGrid event ID (deduplication) |
| event | text | NOT NULL | Event type: `delivered`, `open`, `click`, `bounce`, `dropped`, etc. |
| timestamp | timestamp | NOT NULL | When event occurred |
| metadata | text | nullable | JSON metadata (IP, user agent, bounce reason, etc.) |
| createdAt | timestamp | NOT NULL, default now | Record creation |

**Relationship:** Many-to-one with `emailSends` (cascade delete).

---

### passwordResetTokens

Secure token storage for password reset flows.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PK, UUID | Unique identifier |
| userId | text | FK -> users.id (cascade), NOT NULL | User requesting reset |
| tokenHash | text | NOT NULL | SHA-256 hash of token (token itself never stored) |
| expiresAt | timestamp | NOT NULL | 1-hour expiration |
| used | boolean | NOT NULL, default false | Has token been consumed |
| createdAt | timestamp | NOT NULL, default now | Token creation |

**Relationship:** Many-to-one with `users` (cascade delete).

---

### accounts (NextAuth)

OAuth/provider account links. Standard NextAuth table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| userId | text | FK -> users.id (cascade), NOT NULL | Account owner |
| type | text | NOT NULL | Account type |
| provider | text | PK (composite) | OAuth provider name |
| providerAccountId | text | PK (composite) | Provider's account ID |
| refresh_token, access_token, expires_at, token_type, scope, id_token, session_state | various | nullable | OAuth fields |

---

### sessions (NextAuth)

Active user sessions. Standard NextAuth table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| sessionToken | text | PK | Session identifier |
| userId | text | FK -> users.id (cascade), NOT NULL | Session owner |
| expires | timestamp | NOT NULL | Expiration time |

---

### verificationTokens (NextAuth)

Email verification tokens. Standard NextAuth table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| identifier | text | PK (composite) | Email/identifier |
| token | text | PK (composite) | Token value |
| expires | timestamp | NOT NULL | Expiration time |

---

## Key Relationships Summary

### One-to-Many

| Parent | Child | FK Column | On Delete |
|--------|-------|-----------|-----------|
| users | medications | userId | CASCADE |
| users | conversations | userId | CASCADE |
| users | imageCaptures | userId | CASCADE |
| users | emailSends | userId | SET NULL |
| users | passwordResetTokens | userId | CASCADE |
| users | accounts | userId | CASCADE |
| users | sessions | userId | CASCADE |
| users | clinicalNotes | authorId | CASCADE |
| medications | clinicalNotes | medicationId | CASCADE |
| conversations | conversationMessages | conversationId | CASCADE |
| conversations | imageCaptures | conversationId | SET NULL |
| emailSends | emailEvents | emailSendId | CASCADE |

### Many-to-Many

| Table A | Junction Table | Table B | Description |
|---------|---------------|---------|-------------|
| users (providers) | providerPatients | users (patients) | Provider-patient assignments |

### Self-Referencing (users table)

The `providerPatients` table references `users` three times:
1. `providerId` -> the provider
2. `patientId` -> the patient
3. `assignedBy` -> who made the assignment

---

## Authorization Model

```
Patient:   Can access own medications, conversations, emails, settings
Provider:  Can access assigned patients' medications, conversations, emails + write clinical notes
Admin:     Can access everything + user management + impersonation
```

Authorization is enforced via `canAccessPatientData(callerId, patientId)` in `app/src/lib/authorization.ts`, which checks:
1. Is the caller the patient themselves?
2. Is the caller an admin?
3. Is the caller a provider assigned to this patient via `providerPatients`?
