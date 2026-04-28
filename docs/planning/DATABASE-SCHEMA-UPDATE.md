# Database Schema Update Plan

Update the database schema to properly support conversation transcripts with summaries and image captures from webcam.

## Current Schema

```
conversations
  id            TEXT PRIMARY KEY
  userId        TEXT -> users.id
  status        TEXT ("active" | "ended")
  startedAt     TIMESTAMP
  endedAt       TIMESTAMP

conversationMessages
  id              TEXT PRIMARY KEY
  conversationId  TEXT -> conversations.id
  role            TEXT ("user" | "agent")
  content         TEXT
  toolName        TEXT (nullable)
  toolArgs        TEXT (nullable)
  createdAt       TIMESTAMP
```

## Proposed Changes

### 1. Update `conversations` table

Add three new columns for title, full transcript text, and AI-generated summary.

```typescript
export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"),
  title: text("title"),                                          // NEW — short title, e.g. "Morning medication check-in"
  transcript: text("transcript"),                                // NEW — full concatenated transcript text
  summary: text("summary"),                                      // NEW — AI-generated summary of the conversation
  startedAt: timestamp("started_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),  // CHANGED — add withTimezone
  endedAt: timestamp("ended_at", { mode: "date", withTimezone: true }),                              // CHANGED — add withTimezone
});
```

**New columns:**

| Column | Type | Description |
|---|---|---|
| `title` | TEXT (nullable) | Short title for the conversation, generated from content or set by AI |
| `transcript` | TEXT (nullable) | Full concatenated transcript of the conversation (built when conversation ends) |
| `summary` | TEXT (nullable) | AI-generated summary of the conversation (generated when conversation ends) |

**Changed columns:**

| Column | Change | Why |
|---|---|---|
| `startedAt` | Add `withTimezone: true` | Store in UTC, convert to local on display |
| `endedAt` | Add `withTimezone: true` | Store in UTC, convert to local on display |

### 2. Update `conversationMessages` table

Add timezone support to timestamps.

```typescript
export const conversationMessages = pgTable("conversation_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  toolName: text("tool_name"),
  toolArgs: text("tool_args"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),  // CHANGED
});
```

### 3. Create `imageCaptures` table (NEW)

Store images captured during voice conversations. Relationships:
- One user has many image captures
- One conversation has many image captures (optional — images can exist outside conversations)

```typescript
export const imageCaptures = pgTable("image_captures", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conversationId: text("conversation_id")
    .references(() => conversations.id, { onDelete: "set null" }),   // nullable — image may not be tied to a conversation
  imageUrl: text("image_url").notNull(),                             // URL to stored image (Vercel Blob or S3)
  imageBase64: text("image_base64"),                                 // optional fallback — base64 encoded image data
  extractedText: text("extracted_text"),                             // raw text extracted from the image by vision LLM
  description: text("description"),                                  // human-readable description of what was seen
  extractedMedications: text("extracted_medications"),                // JSON string of structured medication data
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});
```

**Columns:**

| Column | Type | Required | Description |
|---|---|---|---|
| `id` | TEXT | Yes | UUID primary key |
| `userId` | TEXT | Yes | FK to users — one user has many captures |
| `conversationId` | TEXT | No | FK to conversations — one conversation has many captures. Nullable for standalone captures. |
| `imageUrl` | TEXT | Yes | URL to the stored image file |
| `imageBase64` | TEXT | No | Base64 image data (fallback if no blob storage) |
| `extractedText` | TEXT | No | Raw text extracted from the image |
| `description` | TEXT | No | Human-readable description of the image |
| `extractedMedications` | TEXT | No | JSON string: `[{ name, dosage, frequency, instructions, ... }]` |
| `createdAt` | TIMESTAMP WITH TZ | Yes | When the image was captured (UTC) |

## Entity Relationships

```
users (1) ----< (many) conversations
users (1) ----< (many) imageCaptures
conversations (1) ----< (many) conversationMessages
conversations (1) ----< (many) imageCaptures
```

```
+--------+       +----------------+       +----------------------+
| users  |------>| conversations  |------>| conversationMessages |
|        |       |                |       +----------------------+
|        |       |  title         |
|        |       |  transcript    |------>| imageCaptures        |
|        |       |  summary       |       |                      |
|        |       |  startedAt(TZ) |       |  imageUrl            |
|        |       |  endedAt(TZ)   |       |  extractedText       |
+--------+       +----------------+       |  description         |
    |                                     |  extractedMedications|
    +----------------------------------->| createdAt(TZ)        |
                                          +----------------------+
```

## Timezone Handling

**Storage:** All timestamps stored as `TIMESTAMP WITH TIME ZONE` in PostgreSQL (UTC).

**Display:** Convert to the user's local timezone on the client side using the browser's `Intl.DateTimeFormat` or a utility function:

```typescript
function formatLocalTime(utcDate: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(utcDate);
}

// Example:
// UTC: 2026-02-04T17:30:00.000Z
// EST: "Feb 4, 2026, 12:30 PM"
// PST: "Feb 4, 2026, 9:30 AM"
```

## Transcript & Summary Generation

When a conversation ends (user clicks "End Call"):

1. **Build transcript:** Query all `conversationMessages` for the conversation, concatenate into a single text block with role labels
2. **Generate summary:** Send the transcript to an LLM with a prompt like: "Summarize this medication management conversation in 2-3 sentences. Include any medications added, changed, or discussed."
3. **Generate title:** Ask the LLM for a short title (under 50 characters) based on the transcript
4. **Update conversation:** Set `transcript`, `summary`, `title`, `status = "ended"`, `endedAt`

This happens in the `PATCH /api/voice/conversations/messages` endpoint (which already handles ending conversations).

## Image Storage

For MVP, store images as base64 in the database (`imageBase64` column). For production scale, use Vercel Blob Storage or S3 and store the URL in `imageUrl`.

## Files to Modify

| File | Change |
|---|---|
| `src/lib/db/schema.ts` | Add `title`, `transcript`, `summary` to conversations; add `withTimezone` to all timestamps; add `imageCaptures` table |
| `src/app/api/voice/conversations/messages/route.ts` | Update PATCH handler to build transcript, generate summary/title when ending conversation |
| `src/app/api/voice/image-capture/route.ts` | New endpoint — accepts image, calls vision LLM, stores in `imageCaptures` |

## Migration Steps

1. Update `src/lib/db/schema.ts` with all changes above
2. Run `npx drizzle-kit push` from `app/` to apply schema changes to Neon
3. Update the PATCH endpoint to generate transcript/summary/title on conversation end
4. Create the image capture endpoint
5. Update CLAUDE.md with new tables
6. Test locally
7. Deploy and test on production

## Verification

1. Start a voice conversation, have a brief exchange, end the call
2. Check the database — conversation should have `title`, `transcript`, and `summary` populated
3. Verify timestamps are stored in UTC
4. Verify timestamps display in local time on the website
5. All existing Playwright tests should still pass
